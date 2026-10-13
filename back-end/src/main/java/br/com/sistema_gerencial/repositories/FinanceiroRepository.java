package br.com.sistema_gerencial.repositories;

import static br.com.sistema_gerencial.models.financeiro.FinanceiroModels.*;
import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import org.springframework.jdbc.core.namedparam.*;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;
import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class FinanceiroRepository {
    private final NamedParameterJdbcTemplate jdbc;

    private static final String CONTAS = """
        SELECT f.id, 'MANUAL' origem, f.tipo, f.descricao, f.contraparte, f.categoria, f.referencia,
          f.vencimento, f.valor, f.valor_baixado, f.valor - f.valor_baixado saldo,
          CASE WHEN f.cancelada THEN 'CANCELADA' WHEN f.valor = f.valor_baixado THEN 'QUITADA'
            WHEN f.vencimento < :hoje THEN 'VENCIDA' WHEN f.valor_baixado > 0 THEN 'PARCIAL' ELSE 'ABERTA' END status,
          NULL venda_id, f.entidade_tipo, f.entidade_id
        FROM financeiro_contas f
        UNION ALL
        SELECT p.id, 'VENDA' origem, 'RECEBER' tipo,
          CONCAT('Venda #', v.id, ' / parcela ', p.numero_parcela) descricao,
          v.cliente_nome contraparte, 'Vendas' categoria, v.codigo referencia,
          p.data_vencimento vencimento, p.valor_previsto valor, p.valor_pago valor_baixado, p.saldo_aberto saldo,
          CASE WHEN v.status = 'CANCELADA' THEN 'CANCELADA' WHEN p.saldo_aberto <= 0 THEN 'QUITADA'
            WHEN p.data_vencimento < :hoje THEN 'VENCIDA' WHEN p.valor_pago > 0 THEN 'PARCIAL' ELSE 'ABERTA' END status,
          v.id venda_id, 'VENDA' entidade_tipo, v.id entidade_id
        FROM parcelas p JOIN vendas v ON v.id = p.id_venda
        """;

    private record Consulta(String where, MapSqlParameterSource params) {}
    private Consulta consulta(Filtro filtro) {
        StringBuilder where = new StringBuilder(" WHERE 1=1");
        var params = new MapSqlParameterSource("hoje", LocalDate.now(ZoneId.of("America/Sao_Paulo")));
        if (filtro.tipo() != null) { where.append(" AND tipo=:tipo"); params.addValue("tipo", filtro.tipo()); }
        if (filtro.status() != null) { where.append(" AND status=:status"); params.addValue("status", filtro.status()); }
        if (filtro.inicio() != null) { where.append(" AND vencimento>=:inicio"); params.addValue("inicio", filtro.inicio()); }
        if (filtro.fim() != null) { where.append(" AND vencimento<=:fim"); params.addValue("fim", filtro.fim()); }
        if (filtro.categoria() != null) { where.append(" AND categoria=:categoria"); params.addValue("categoria", filtro.categoria()); }
        if (filtro.pesquisa() != null) {
            where.append(" AND (LOWER(descricao) LIKE :pesquisa OR LOWER(contraparte) LIKE :pesquisa OR LOWER(referencia) LIKE :pesquisa)");
            params.addValue("pesquisa", "%" + filtro.pesquisa().toLowerCase(java.util.Locale.ROOT) + "%");
        }
        return new Consulta(where.toString(), params);
    }

    public Pagina listar(Filtro filtro, int page, int limit) {
        var query = consulta(filtro);
        long total = jdbc.queryForObject("SELECT COUNT(*) FROM (" + CONTAS + ") contas" + query.where(), query.params(), Long.class);
        query.params().addValue("limit", limit).addValue("offset", (long)(page-1)*limit);
        var lista = jdbc.query("SELECT * FROM (" + CONTAS + ") contas" + query.where()
            + " ORDER BY vencimento,id,origem LIMIT :limit OFFSET :offset", query.params(), this::mapConta);
        return new Pagina(lista, total, page, limit);
    }

    public Conta buscar(String origem, long id) {
        var result = jdbc.query("SELECT * FROM (" + CONTAS + ") contas WHERE origem=:origem AND id=:id",
            new MapSqlParameterSource("origem", origem).addValue("id", id)
                .addValue("hoje", LocalDate.now(ZoneId.of("America/Sao_Paulo"))), this::mapConta);
        return result.isEmpty() ? null : result.getFirst();
    }

    public void bloquear(String origem, long id) {
        String table = "VENDA".equals(origem) ? "parcelas" : "financeiro_contas";
        jdbc.queryForList("SELECT id FROM " + table + " WHERE id=:id FOR UPDATE", new MapSqlParameterSource("id", id));
    }

    public long criar(ContaRequest request) {
        var key = new GeneratedKeyHolder();
        jdbc.update("""
            INSERT INTO financeiro_contas(tipo,descricao,contraparte,categoria,referencia,vencimento,valor,entidade_tipo,entidade_id)
            VALUES(:tipo,:descricao,:contraparte,:categoria,:referencia,:vencimento,:valor,:entidadeTipo,:entidadeId)
            """, params(request), key, new String[]{"id"});
        return key.getKey().longValue();
    }

    public void atualizar(long id, ContaRequest request) {
        jdbc.update("""
            UPDATE financeiro_contas SET descricao=:descricao,contraparte=:contraparte,categoria=:categoria,
              referencia=:referencia,vencimento=:vencimento,valor=:valor,entidade_tipo=:entidadeTipo,entidade_id=:entidadeId
            WHERE id=:id
            """, params(request).addValue("id", id));
    }

    private MapSqlParameterSource params(ContaRequest r) {
        return new MapSqlParameterSource("tipo",r.tipo()).addValue("descricao",r.descricao().trim())
            .addValue("contraparte",r.contraparte().trim()).addValue("categoria",limpar(r.categoria()))
            .addValue("referencia",limpar(r.referencia())).addValue("vencimento",r.vencimento())
            .addValue("valor",r.valor()).addValue("entidadeTipo",limpar(r.entidadeTipo())).addValue("entidadeId",r.entidadeId());
    }
    private String limpar(String value) { return value == null || value.isBlank() ? null : value.trim(); }

    public void cancelar(long id) {
        jdbc.update("UPDATE financeiro_contas SET cancelada=TRUE WHERE id=:id", new MapSqlParameterSource("id",id));
    }
    public void baixarManual(long id, BaixaRequest request) {
        var params = new MapSqlParameterSource("id",id).addValue("data",request.data()).addValue("valor",request.valor())
            .addValue("forma",request.formaPagamento().trim()).addValue("observacoes",limpar(request.observacoes()));
        jdbc.update("INSERT INTO financeiro_baixas(id_conta,data_baixa,valor,forma_pagamento,observacoes) VALUES(:id,:data,:valor,:forma,:observacoes)", params);
        jdbc.update("UPDATE financeiro_contas SET valor_baixado=valor_baixado+:valor WHERE id=:id",params);
    }

    public List<Baixa> baixas(String origem, long id) {
        String sql = "VENDA".equals(origem)
            ? "SELECT id,CAST(data_pagamento AS DATE) data,valor_pago valor,forma_pagamento,observacoes FROM pagamentos WHERE id_parcela=:id ORDER BY data_pagamento,id"
            : "SELECT id,data_baixa data,valor,forma_pagamento,observacoes FROM financeiro_baixas WHERE id_conta=:id ORDER BY data_baixa,id";
        return jdbc.query(sql,new MapSqlParameterSource("id",id), (rs,n) -> new Baixa(rs.getLong("id"),rs.getDate("data").toLocalDate(),rs.getBigDecimal("valor"),rs.getString("forma_pagamento"),rs.getString("observacoes")));
    }

    public Resumo resumo(Filtro filtro, BigDecimal pago, BigDecimal recebido) {
        var q=consulta(filtro);
        return jdbc.queryForObject("""
            SELECT COALESCE(SUM(CASE WHEN tipo='PAGAR' AND status<>'CANCELADA' THEN saldo ELSE 0 END),0) pagar,
              COALESCE(SUM(CASE WHEN tipo='RECEBER' AND status<>'CANCELADA' THEN saldo ELSE 0 END),0) receber,
              COALESCE(SUM(CASE WHEN tipo='PAGAR' AND status='VENCIDA' THEN saldo ELSE 0 END),0) pagar_vencido,
              COALESCE(SUM(CASE WHEN tipo='RECEBER' AND status='VENCIDA' THEN saldo ELSE 0 END),0) receber_vencido
            FROM (
            """ + CONTAS + ") contas" + q.where(),q.params(), (rs,n)->{
                var pagar=rs.getBigDecimal("pagar"); var receber=rs.getBigDecimal("receber");
                return new Resumo(pagar,receber,rs.getBigDecimal("pagar_vencido"),rs.getBigDecimal("receber_vencido"),pago,recebido,recebido.subtract(pago),receber.subtract(pagar));
            });
    }

    public List<Fluxo> previsto(Filtro filtro) {
        var q=consulta(filtro);
        return jdbc.query("SELECT vencimento data, SUM(CASE WHEN tipo='RECEBER' THEN saldo ELSE 0 END) entradas,"
            + " SUM(CASE WHEN tipo='PAGAR' THEN saldo ELSE 0 END) saidas FROM ("+CONTAS+") contas"
            +q.where()+" AND status<>'CANCELADA' AND saldo>0 GROUP BY vencimento ORDER BY vencimento", q.params(),this::mapFluxo);
    }

    public List<Fluxo> realizado(Filtro filtro) {
        // Payment dates, rather than due dates, determine the realized cash flow.
        String sql="""
            SELECT data, SUM(entradas) entradas, SUM(saidas) saidas FROM (
              SELECT b.data_baixa data, CASE WHEN f.tipo='RECEBER' THEN b.valor ELSE 0 END entradas,
                CASE WHEN f.tipo='PAGAR' THEN b.valor ELSE 0 END saidas, f.tipo, f.categoria
              FROM financeiro_baixas b JOIN financeiro_contas f ON f.id=b.id_conta
              UNION ALL
              SELECT CAST(p.data_pagamento AS DATE) data, p.valor_pago entradas, 0 saidas, 'RECEBER' tipo, 'Vendas' categoria
              FROM pagamentos p
            ) movimentos WHERE 1=1
            """;
        var params=new MapSqlParameterSource();
        if(filtro.inicio()!=null){sql+=" AND data>=:inicio";params.addValue("inicio",filtro.inicio());}
        if(filtro.fim()!=null){sql+=" AND data<=:fim";params.addValue("fim",filtro.fim());}
        if(filtro.tipo()!=null){sql+=" AND tipo=:tipo";params.addValue("tipo",filtro.tipo());}
        if(filtro.categoria()!=null){sql+=" AND categoria=:categoria";params.addValue("categoria",filtro.categoria());}
        return jdbc.query(sql+" GROUP BY data ORDER BY data",params,this::mapFluxo);
    }

    private Fluxo mapFluxo(ResultSet rs,int n) throws SQLException {
        var entradas=rs.getBigDecimal("entradas");var saidas=rs.getBigDecimal("saidas");
        return new Fluxo(rs.getDate("data").toLocalDate(),entradas,saidas,entradas.subtract(saidas));
    }
    private Conta mapConta(ResultSet rs,int n) throws SQLException {
        return new Conta(rs.getLong("id"),rs.getString("origem"),rs.getString("tipo"),rs.getString("descricao"),rs.getString("contraparte"),
            rs.getString("categoria"),rs.getString("referencia"),rs.getDate("vencimento").toLocalDate(),rs.getBigDecimal("valor"),
            rs.getBigDecimal("valor_baixado"),rs.getBigDecimal("saldo"),rs.getString("status"),rs.getObject("venda_id")==null?null:((Number)rs.getObject("venda_id")).intValue(),
            rs.getString("entidade_tipo"),rs.getObject("entidade_id")==null?null:rs.getLong("entidade_id"));
    }
}
