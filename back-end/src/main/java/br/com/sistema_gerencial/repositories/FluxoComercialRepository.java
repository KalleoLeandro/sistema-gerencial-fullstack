package br.com.sistema_gerencial.repositories;

import java.io.IOException;
import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.dao.DataAccessException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

import br.com.sistema_gerencial.exceptions.DefaultErrorException;
import br.com.sistema_gerencial.models.dto.OrigemComercialDTO;
import br.com.sistema_gerencial.models.dto.OutboxEventoDTO;
import br.com.sistema_gerencial.models.response.CaixaFechamentoResponse;
import br.com.sistema_gerencial.models.response.CaixaResumoPagamentoResponse;
import br.com.sistema_gerencial.models.response.OrcamentoItemResponse;
import br.com.sistema_gerencial.models.response.OrcamentoResponse;
import br.com.sistema_gerencial.models.response.PagamentoResponse;
import br.com.sistema_gerencial.models.response.ParcelaResponse;
import br.com.sistema_gerencial.models.response.VendaResponse;
import lombok.RequiredArgsConstructor;

/**
 * Consulta e persiste os dados de orçamentos, vendas, parcelas e caixa por meio de SQL e JDBC.
 */
@Repository
@RequiredArgsConstructor
public class FluxoComercialRepository {

	private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;
	private final ObjectMapper objectMapper;

	private final RowMapper<OrcamentoResponse> orcamentoMapper = (rs, rowNum) -> OrcamentoResponse.builder()
			.id(rs.getInt("id"))
			.codigo(rs.getString("codigo"))
			.origem_tipo(rs.getString("origem_tipo"))
			.id_atendimento((Integer) rs.getObject("id_atendimento"))
			.id_manutencao((Integer) rs.getObject("id_manutencao"))
			.id_avulso((Integer) rs.getObject("id_avulso"))
			.cliente_nome(rs.getString("cliente_nome"))
			.cliente_documento(rs.getString("cliente_documento"))
			.status(rs.getString("status"))
			.validade_em(rs.getObject("validade_em", LocalDate.class))
			.aprovado_em(getLocalDateTime(rs, "aprovado_em"))
			.desconto_financeiro(rs.getBigDecimal("desconto_financeiro"))
			.acrescimo_financeiro(rs.getBigDecimal("acrescimo_financeiro"))
			.subtotal(rs.getBigDecimal("subtotal"))
			.total_desconto(rs.getBigDecimal("total_desconto"))
			.total_acrescimo(rs.getBigDecimal("total_acrescimo"))
			.total_geral(rs.getBigDecimal("total_geral"))
			.observacoes(rs.getString("observacoes"))
			.criado_em(getLocalDateTime(rs, "criado_em"))
			.atualizado_em(getLocalDateTime(rs, "atualizado_em"))
			.itens(Collections.emptyList())
			.build();

	private final RowMapper<OrcamentoItemResponse> orcamentoItemMapper = (rs, rowNum) -> OrcamentoItemResponse.builder()
			.id(rs.getInt("id"))
			.tipo_item(rs.getString("tipo_item"))
			.id_produto((Integer) rs.getObject("id_produto"))
			.id_servico((Integer) rs.getObject("id_servico"))
			.descricao(rs.getString("descricao"))
			.quantidade(rs.getBigDecimal("quantidade"))
			.valor_unitario(rs.getBigDecimal("valor_unitario"))
			.percentual_desconto(rs.getBigDecimal("percentual_desconto"))
			.valor_desconto(rs.getBigDecimal("valor_desconto"))
			.valor_total(rs.getBigDecimal("valor_total"))
			.ordem(rs.getInt("ordem"))
			.criado_em(getLocalDateTime(rs, "criado_em"))
			.atualizado_em(getLocalDateTime(rs, "atualizado_em"))
			.build();

	private final RowMapper<VendaResponse> vendaMapper = (rs, rowNum) -> VendaResponse.builder()
			.id(rs.getInt("id"))
			.codigo(rs.getString("codigo"))
			.id_orcamento(rs.getInt("id_orcamento"))
			.origem_tipo(rs.getString("origem_tipo"))
			.cliente_nome(rs.getString("cliente_nome"))
			.cliente_documento(rs.getString("cliente_documento"))
			.status(rs.getString("status"))
			.data_venda(getLocalDateTime(rs, "data_venda"))
			.forma_pagamento(rs.getString("forma_pagamento"))
			.quantidade_parcelas(rs.getInt("quantidade_parcelas"))
			.subtotal(rs.getBigDecimal("subtotal"))
			.total_desconto(rs.getBigDecimal("total_desconto"))
			.total_acrescimo(rs.getBigDecimal("total_acrescimo"))
			.total_geral(rs.getBigDecimal("total_geral"))
			.observacoes(rs.getString("observacoes"))
			.criado_em(getLocalDateTime(rs, "criado_em"))
			.atualizado_em(getLocalDateTime(rs, "atualizado_em"))
			.itens(Collections.emptyList())
			.parcelas(Collections.emptyList())
			.build();

	private final RowMapper<ParcelaResponse> parcelaMapper = (rs, rowNum) -> ParcelaResponse.builder()
			.id(rs.getInt("id"))
			.numero_parcela(rs.getInt("numero_parcela"))
			.data_vencimento(rs.getObject("data_vencimento", LocalDate.class))
			.status(rs.getString("status"))
			.valor_previsto(rs.getBigDecimal("valor_previsto"))
			.valor_pago(rs.getBigDecimal("valor_pago"))
			.saldo_aberto(rs.getBigDecimal("saldo_aberto"))
			.data_ultimo_pagamento(getLocalDateTime(rs, "data_ultimo_pagamento"))
			.observacoes(rs.getString("observacoes"))
			.pagamentos(Collections.emptyList())
			.build();

	private final RowMapper<PagamentoResponse> pagamentoMapper = (rs, rowNum) -> PagamentoResponse.builder()
			.id(rs.getInt("id"))
			.codigo(rs.getString("codigo"))
			.id_parcela(rs.getInt("id_parcela"))
			.data_pagamento(getLocalDateTime(rs, "data_pagamento"))
			.forma_pagamento(rs.getString("forma_pagamento"))
			.valor_pago(rs.getBigDecimal("valor_pago"))
			.valor_entregue(rs.getBigDecimal("valor_entregue"))
			.troco(rs.getBigDecimal("troco"))
			.observacoes(rs.getString("observacoes"))
			.criado_em(getLocalDateTime(rs, "criado_em"))
			.build();

	private final RowMapper<CaixaResumoPagamentoResponse> caixaResumoPagamentoMapper = (rs, rowNum) -> CaixaResumoPagamentoResponse.builder()
			.forma_pagamento(rs.getString("forma_pagamento"))
			.valor_total(rs.getBigDecimal("valor_total"))
			.valor_recebido(rs.getBigDecimal("valor_recebido"))
			.valor_entregue(rs.getBigDecimal("valor_entregue"))
			.troco(rs.getBigDecimal("troco"))
			.build();

	private final RowMapper<CaixaFechamentoResponse> caixaFechamentoMapper = (rs, rowNum) -> CaixaFechamentoResponse.builder()
			.id(rs.getInt("id"))
			.data_referencia(rs.getObject("data_referencia", LocalDate.class))
			.fechado_em(getLocalDateTime(rs, "fechado_em"))
			.valor_total(rs.getBigDecimal("valor_total"))
			.valor_informado(rs.getBigDecimal("valor_informado"))
			.valor_quebra(rs.getBigDecimal("valor_quebra"))
			.observacoes(rs.getString("observacoes"))
			.build();

	public OrigemComercialDTO buscarOrigem(String origemTipo, int origemId) {
		String tipoNormalizado = normalizeOrigem(origemTipo);
		String sql;
		if ("ATENDIMENTO".equals(tipoNormalizado)) {
			sql = """
					SELECT a.id AS origem_id, 'ATENDIMENTO' AS origem_tipo,
					       COALESCE(NULLIF(e.nome_fantasia, ''), NULLIF(e.razao_social, ''), NULLIF(e.nome, ''), 'Consumidor final') AS cliente_nome,
					       COALESCE(NULLIF(e.cpf, ''), NULLIF(e.cnpj, '')) AS cliente_documento,
					       a.observacoes
					FROM atendimentos a
					INNER JOIN clientes e ON e.id = a.id_empresa
					WHERE a.id = :origemId
					""";
		} else if ("MANUTENCAO".equals(tipoNormalizado)) {
			sql = """
					SELECT m.id AS origem_id, 'MANUTENCAO' AS origem_tipo,
					       COALESCE(NULLIF(e.nome_fantasia, ''), NULLIF(e.razao_social, ''), NULLIF(e.nome, ''), 'Consumidor final') AS cliente_nome,
					       COALESCE(NULLIF(e.cpf, ''), NULLIF(e.cnpj, '')) AS cliente_documento,
					       m.observacoes
					FROM manutencao m
					INNER JOIN equipamentos eq ON eq.id = m.id_equipamento
					INNER JOIN clientes e ON e.id = eq.id_empresa
					WHERE m.id = :origemId
					""";
		} else if ("AVULSO".equals(tipoNormalizado)) {
			sql = """
					SELECT a.id AS origem_id, 'AVULSO' AS origem_tipo, a.nome_cliente AS cliente_nome,
					       a.cpf_cnpj AS cliente_documento, a.observacoes
					FROM avulsos a
					WHERE a.id = :origemId
					""";
		} else {
			throw new DefaultErrorException("Origem comercial invalida.", HttpStatus.BAD_REQUEST);
		}

		try {
			return namedParameterJdbcTemplate.queryForObject(sql,
					new MapSqlParameterSource("origemId", origemId),
					(rs, rowNum) -> OrigemComercialDTO.builder()
							.origemId(rs.getInt("origem_id"))
							.origemTipo(rs.getString("origem_tipo"))
							.clienteNome(rs.getString("cliente_nome"))
							.clienteDocumento(rs.getString("cliente_documento"))
							.observacoes(rs.getString("observacoes"))
							.build());
		} catch (EmptyResultDataAccessException exception) {
			throw new DefaultErrorException("Origem comercial nao encontrada.", HttpStatus.NOT_FOUND);
		} catch (DataAccessException exception) {
			throw new DefaultErrorException("Erro ao consultar a origem comercial.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public Integer buscarIdOrcamentoPorOrigem(String origemTipo, int origemId) {
		String tipoNormalizado = normalizeOrigem(origemTipo);
		String sql = switch (tipoNormalizado) {
		case "ATENDIMENTO" -> "SELECT id FROM orcamentos WHERE id_atendimento = :origemId";
		case "MANUTENCAO" -> "SELECT id FROM orcamentos WHERE id_manutencao = :origemId";
		case "AVULSO" -> "SELECT id FROM orcamentos WHERE id_avulso = :origemId";
		default -> throw new DefaultErrorException("Origem comercial invalida.", HttpStatus.BAD_REQUEST);
		};
		try {
			return namedParameterJdbcTemplate.queryForObject(sql, new MapSqlParameterSource("origemId", origemId), Integer.class);
		} catch (EmptyResultDataAccessException exception) {
			return null;
		} catch (DataAccessException exception) {
			throw new DefaultErrorException("Erro ao consultar o orcamento da origem.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public int inserirOrcamento(String codigo, OrigemComercialDTO origem, String observacoes) {
		KeyHolder keyHolder = new GeneratedKeyHolder();
		String sql = """
				INSERT INTO orcamentos (
					codigo, origem_tipo, id_atendimento, id_manutencao, id_avulso, cliente_nome,
					cliente_documento, status, observacoes
				) VALUES (
					:codigo, :origemTipo, :idAtendimento, :idManutencao, :idAvulso, :clienteNome,
					:clienteDocumento, :status, :observacoes
				)
				""";
		MapSqlParameterSource params = new MapSqlParameterSource()
				.addValue("codigo", codigo)
				.addValue("origemTipo", origem.getOrigemTipo())
				.addValue("idAtendimento", "ATENDIMENTO".equals(origem.getOrigemTipo()) ? origem.getOrigemId() : null)
				.addValue("idManutencao", "MANUTENCAO".equals(origem.getOrigemTipo()) ? origem.getOrigemId() : null)
				.addValue("idAvulso", "AVULSO".equals(origem.getOrigemTipo()) ? origem.getOrigemId() : null)
				.addValue("clienteNome", origem.getClienteNome())
				.addValue("clienteDocumento", origem.getClienteDocumento())
				.addValue("status", "ABERTO")
				.addValue("observacoes", observacoes);
		try {
			namedParameterJdbcTemplate.update(sql, params, keyHolder, new String[] { "id" });
			return keyHolder.getKey().intValue();
		} catch (DataAccessException exception) {
			throw new DefaultErrorException("Erro ao gerar o orcamento.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public void atualizarCodigoOrcamento(int idOrcamento, String codigo) {
		String sql = "UPDATE orcamentos SET codigo = :codigo WHERE id = :id";
		try {
			namedParameterJdbcTemplate.update(sql, new MapSqlParameterSource()
					.addValue("codigo", codigo)
					.addValue("id", idOrcamento));
		} catch (DataAccessException exception) {
			throw new DefaultErrorException("Erro ao atualizar o codigo do orcamento.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public OrcamentoResponse buscarOrcamentoPorId(int id) {
		String sql = "SELECT * FROM orcamentos WHERE id = :id";
		try {
			OrcamentoResponse orcamento = namedParameterJdbcTemplate.queryForObject(sql,
					new MapSqlParameterSource("id", id), orcamentoMapper);
			orcamento.setItens(listarItensOrcamento(id));
			return orcamento;
		} catch (EmptyResultDataAccessException exception) {
			throw new DefaultErrorException("Orcamento nao encontrado.", HttpStatus.NOT_FOUND);
		} catch (DataAccessException exception) {
			throw new DefaultErrorException("Erro ao consultar o orcamento.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public OrcamentoResponse buscarOrcamentoPorOrigem(String origemTipo, int origemId) {
		Integer id = buscarIdOrcamentoPorOrigem(origemTipo, origemId);
		if (id == null) {
			throw new DefaultErrorException("Orcamento da origem nao encontrado.", HttpStatus.NOT_FOUND);
		}
		return buscarOrcamentoPorId(id);
	}

	public Map<String, Object> listarOrcamentosPorPagina(int limit, int page, String pesquisa) {
		String filtro = buildLikeFilter(pesquisa);
		String sql = """
				SELECT *
				FROM orcamentos
				WHERE (:pesquisa IS NULL
				       OR UPPER(COALESCE(codigo, '')) LIKE :pesquisa
				       OR UPPER(COALESCE(cliente_nome, '')) LIKE :pesquisa
				       OR UPPER(COALESCE(cliente_documento, '')) LIKE :pesquisa
				       OR UPPER(COALESCE(origem_tipo, '')) LIKE :pesquisa
				       OR UPPER(COALESCE(status, '')) LIKE :pesquisa)
				ORDER BY id DESC
				LIMIT :limit OFFSET :offset
				""";
		MapSqlParameterSource params = new MapSqlParameterSource()
				.addValue("pesquisa", filtro)
				.addValue("limit", limit)
				.addValue("offset", (page - 1) * limit);
		String sqlTotal = """
				SELECT COUNT(id)
				FROM orcamentos
				WHERE (:pesquisa IS NULL
				       OR UPPER(COALESCE(codigo, '')) LIKE :pesquisa
				       OR UPPER(COALESCE(cliente_nome, '')) LIKE :pesquisa
				       OR UPPER(COALESCE(cliente_documento, '')) LIKE :pesquisa
				       OR UPPER(COALESCE(origem_tipo, '')) LIKE :pesquisa
				       OR UPPER(COALESCE(status, '')) LIKE :pesquisa)
				""";
		try {
			List<OrcamentoResponse> lista = namedParameterJdbcTemplate.query(sql, params, orcamentoMapper);
			Integer total = namedParameterJdbcTemplate.queryForObject(sqlTotal,
					new MapSqlParameterSource("pesquisa", filtro), Integer.class);
			Map<String, Object> resultado = new HashMap<>();
			resultado.put("lista", lista);
			resultado.put("total", total);
			return resultado;
		} catch (DataAccessException exception) {
			throw new DefaultErrorException("Erro ao listar os orcamentos.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public List<OrcamentoItemResponse> listarItensOrcamento(int idOrcamento) {
		String sql = "SELECT * FROM orcamento_itens WHERE id_orcamento = :idOrcamento ORDER BY ordem ASC, id ASC";
		try {
			return namedParameterJdbcTemplate.query(sql, new MapSqlParameterSource("idOrcamento", idOrcamento), orcamentoItemMapper);
		} catch (DataAccessException exception) {
			throw new DefaultErrorException("Erro ao consultar itens do orcamento.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public void removerItensOrcamento(int idOrcamento) {
		String sql = "DELETE FROM orcamento_itens WHERE id_orcamento = :idOrcamento";
		try {
			namedParameterJdbcTemplate.update(sql, new MapSqlParameterSource("idOrcamento", idOrcamento));
		} catch (DataAccessException exception) {
			throw new DefaultErrorException("Erro ao atualizar itens do orcamento.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public void inserirItemOrcamento(int idOrcamento, OrcamentoItemResponse item) {
		String sql = """
				INSERT INTO orcamento_itens (
					id_orcamento, tipo_item, id_produto, id_servico, descricao, quantidade,
					valor_unitario, percentual_desconto, valor_desconto, valor_total, ordem
				) VALUES (
					:idOrcamento, :tipoItem, :idProduto, :idServico, :descricao, :quantidade,
					:valorUnitario, :percentualDesconto, :valorDesconto, :valorTotal, :ordem
				)
				""";
		MapSqlParameterSource params = new MapSqlParameterSource()
				.addValue("idOrcamento", idOrcamento)
				.addValue("tipoItem", item.getTipo_item())
				.addValue("idProduto", item.getId_produto())
				.addValue("idServico", item.getId_servico())
				.addValue("descricao", item.getDescricao())
				.addValue("quantidade", item.getQuantidade())
				.addValue("valorUnitario", item.getValor_unitario())
				.addValue("percentualDesconto", item.getPercentual_desconto())
				.addValue("valorDesconto", item.getValor_desconto())
				.addValue("valorTotal", item.getValor_total())
				.addValue("ordem", item.getOrdem());
		try {
			namedParameterJdbcTemplate.update(sql, params);
		} catch (DataAccessException exception) {
			throw new DefaultErrorException("Erro ao gravar item do orcamento.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public void atualizarResumoOrcamento(int idOrcamento, LocalDate validadeEm, BigDecimal descontoFinanceiro,
			BigDecimal acrescimoFinanceiro, String clienteNome, String clienteDocumento, BigDecimal subtotal,
			BigDecimal totalDesconto, BigDecimal totalAcrescimo, BigDecimal totalGeral, String status, String observacoes) {
		String sql = """
				UPDATE orcamentos
				SET validade_em = :validadeEm,
				    desconto_financeiro = :descontoFinanceiro,
				    acrescimo_financeiro = :acrescimoFinanceiro,
				    cliente_nome = :clienteNome,
				    cliente_documento = :clienteDocumento,
				    subtotal = :subtotal,
				    total_desconto = :totalDesconto,
				    total_acrescimo = :totalAcrescimo,
				    total_geral = :totalGeral,
				    status = :status,
				    observacoes = :observacoes
				WHERE id = :id
				""";
		MapSqlParameterSource params = new MapSqlParameterSource()
				.addValue("validadeEm", validadeEm)
				.addValue("descontoFinanceiro", descontoFinanceiro)
				.addValue("acrescimoFinanceiro", acrescimoFinanceiro)
				.addValue("clienteNome", clienteNome)
				.addValue("clienteDocumento", clienteDocumento)
				.addValue("subtotal", subtotal)
				.addValue("totalDesconto", totalDesconto)
				.addValue("totalAcrescimo", totalAcrescimo)
				.addValue("totalGeral", totalGeral)
				.addValue("status", status)
				.addValue("observacoes", observacoes)
				.addValue("id", idOrcamento);
		try {
			namedParameterJdbcTemplate.update(sql, params);
		} catch (DataAccessException exception) {
			throw new DefaultErrorException("Erro ao consolidar o orcamento.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public void atualizarValorOrcamentoNaOrigem(String origemTipo, int origemId, BigDecimal valor) {
		String tipoNormalizado = normalizeOrigem(origemTipo);
		String sql = switch (tipoNormalizado) {
		case "ATENDIMENTO" -> "UPDATE atendimentos SET valor_orcamento = :valor WHERE id = :origemId";
		case "MANUTENCAO" -> "UPDATE manutencao SET valor_orcamento = :valor WHERE id = :origemId";
		case "AVULSO" -> "UPDATE avulsos SET valor_orcamento = :valor WHERE id = :origemId";
		default -> throw new DefaultErrorException("Origem comercial invalida.", HttpStatus.BAD_REQUEST);
		};
		try {
			namedParameterJdbcTemplate.update(sql, new MapSqlParameterSource()
					.addValue("valor", valor)
					.addValue("origemId", origemId));
		} catch (DataAccessException exception) {
			throw new DefaultErrorException("Erro ao atualizar o valor do orcamento na origem.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public int inserirVenda(String codigo, OrcamentoResponse orcamento, String formaPagamento, int quantidadeParcelas,
			String observacoes) {
		KeyHolder keyHolder = new GeneratedKeyHolder();
		String sql = """
				INSERT INTO vendas (
					codigo, id_orcamento, origem_tipo, cliente_nome, cliente_documento, status, forma_pagamento,
					quantidade_parcelas, subtotal, total_desconto, total_acrescimo, total_geral, observacoes
				) VALUES (
					:codigo, :idOrcamento, :origemTipo, :clienteNome, :clienteDocumento, :status, :formaPagamento,
					:quantidadeParcelas, :subtotal, :totalDesconto, :totalAcrescimo, :totalGeral, :observacoes
				)
				""";
		MapSqlParameterSource params = new MapSqlParameterSource()
				.addValue("codigo", codigo)
				.addValue("idOrcamento", orcamento.getId())
				.addValue("origemTipo", orcamento.getOrigem_tipo())
				.addValue("clienteNome", orcamento.getCliente_nome())
				.addValue("clienteDocumento", orcamento.getCliente_documento())
				.addValue("status", "ABERTA")
				.addValue("formaPagamento", formaPagamento)
				.addValue("quantidadeParcelas", quantidadeParcelas)
				.addValue("subtotal", orcamento.getSubtotal())
				.addValue("totalDesconto", orcamento.getTotal_desconto())
				.addValue("totalAcrescimo", orcamento.getTotal_acrescimo())
				.addValue("totalGeral", orcamento.getTotal_geral())
				.addValue("observacoes", observacoes);
		try {
			namedParameterJdbcTemplate.update(sql, params, keyHolder, new String[] { "id" });
			return keyHolder.getKey().intValue();
		} catch (DataAccessException exception) {
			throw new DefaultErrorException("Erro ao gerar a venda.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public void inserirItemVenda(int idVenda, OrcamentoItemResponse item) {
		String sql = """
				INSERT INTO venda_itens (
					id_venda, tipo_item, id_produto, id_servico, descricao, quantidade,
					valor_unitario, percentual_desconto, valor_desconto, valor_total
				) VALUES (
					:idVenda, :tipoItem, :idProduto, :idServico, :descricao, :quantidade,
					:valorUnitario, :percentualDesconto, :valorDesconto, :valorTotal
				)
				""";
		MapSqlParameterSource params = new MapSqlParameterSource()
				.addValue("idVenda", idVenda)
				.addValue("tipoItem", item.getTipo_item())
				.addValue("idProduto", item.getId_produto())
				.addValue("idServico", item.getId_servico())
				.addValue("descricao", item.getDescricao())
				.addValue("quantidade", item.getQuantidade())
				.addValue("valorUnitario", item.getValor_unitario())
				.addValue("percentualDesconto", item.getPercentual_desconto())
				.addValue("valorDesconto", item.getValor_desconto())
				.addValue("valorTotal", item.getValor_total());
		try {
			namedParameterJdbcTemplate.update(sql, params);
		} catch (DataAccessException exception) {
			throw new DefaultErrorException("Erro ao gravar item da venda.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public int inserirParcela(int idVenda, int numeroParcela, LocalDate dataVencimento, BigDecimal valorPrevisto) {
		KeyHolder keyHolder = new GeneratedKeyHolder();
		String sql = """
				INSERT INTO parcelas (
					id_venda, numero_parcela, data_vencimento, status, valor_previsto, valor_pago, saldo_aberto
				) VALUES (
					:idVenda, :numeroParcela, :dataVencimento, :status, :valorPrevisto, :valorPago, :saldoAberto
				)
				""";
		MapSqlParameterSource params = new MapSqlParameterSource()
				.addValue("idVenda", idVenda)
				.addValue("numeroParcela", numeroParcela)
				.addValue("dataVencimento", dataVencimento)
				.addValue("status", "ABERTA")
				.addValue("valorPrevisto", valorPrevisto)
				.addValue("valorPago", BigDecimal.ZERO)
				.addValue("saldoAberto", valorPrevisto);
		try {
			namedParameterJdbcTemplate.update(sql, params, keyHolder, new String[] { "id" });
			return keyHolder.getKey().intValue();
		} catch (DataAccessException exception) {
			throw new DefaultErrorException("Erro ao gerar parcela da venda.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public ParcelaResponse buscarParcelaPorNumero(int idVenda, int numeroParcela) {
		String sql = "SELECT * FROM parcelas WHERE id_venda = :idVenda AND numero_parcela = :numeroParcela";
		try {
			return namedParameterJdbcTemplate.queryForObject(sql,
					new MapSqlParameterSource().addValue("idVenda", idVenda).addValue("numeroParcela", numeroParcela),
					parcelaMapper);
		} catch (EmptyResultDataAccessException exception) {
			throw new DefaultErrorException("Parcela informada nao encontrada.", HttpStatus.NOT_FOUND);
		} catch (DataAccessException exception) {
			throw new DefaultErrorException("Erro ao consultar a parcela.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public int inserirPagamento(int idParcela, String codigo, LocalDateTime dataPagamento, String formaPagamento,
			BigDecimal valorPago, String observacoes) {
		return inserirPagamento(idParcela, codigo, dataPagamento, formaPagamento, valorPago, observacoes, valorPago, BigDecimal.ZERO);
	}

	public int inserirPagamento(int idParcela, String codigo, LocalDateTime dataPagamento, String formaPagamento,
			BigDecimal valorPago, String observacoes, BigDecimal valorEntregue, BigDecimal troco) {
		KeyHolder keyHolder = new GeneratedKeyHolder();
		String sql = """
				INSERT INTO pagamentos (
					codigo, id_parcela, data_pagamento, forma_pagamento, valor_pago, observacoes, valor_entregue, troco
				) VALUES (
					:codigo, :idParcela, :dataPagamento, :formaPagamento, :valorPago, :observacoes, :valorEntregue, :troco
				)
				""";
		MapSqlParameterSource params = new MapSqlParameterSource()
				.addValue("codigo", codigo)
				.addValue("idParcela", idParcela)
				.addValue("dataPagamento", dataPagamento)
				.addValue("formaPagamento", formaPagamento)
				.addValue("valorPago", valorPago)
				.addValue("valorEntregue", valorEntregue)
				.addValue("troco", troco)
				.addValue("observacoes", observacoes);
		try {
			namedParameterJdbcTemplate.update(sql, params, keyHolder, new String[] { "id" });
			return keyHolder.getKey().intValue();
		} catch (DataAccessException exception) {
			throw new DefaultErrorException("Erro ao registrar pagamento.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public void atualizarParcelaAposPagamento(int idParcela, BigDecimal valorPago, BigDecimal saldoAberto,
			String status, LocalDateTime dataPagamento) {
		String sql = """
				UPDATE parcelas
				SET valor_pago = :valorPago,
				    saldo_aberto = :saldoAberto,
				    status = :status,
				    data_ultimo_pagamento = :dataPagamento
				WHERE id = :idParcela
				""";
		try {
			namedParameterJdbcTemplate.update(sql, new MapSqlParameterSource()
					.addValue("valorPago", valorPago)
					.addValue("saldoAberto", saldoAberto)
					.addValue("status", status)
					.addValue("dataPagamento", dataPagamento)
					.addValue("idParcela", idParcela));
		} catch (DataAccessException exception) {
			throw new DefaultErrorException("Erro ao atualizar a parcela.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public void aprovarOrcamento(int idOrcamento, LocalDateTime aprovadoEm) {
		String sql = "UPDATE orcamentos SET status = 'APROVADO', aprovado_em = :aprovadoEm WHERE id = :id";
		try {
			namedParameterJdbcTemplate.update(sql, new MapSqlParameterSource()
					.addValue("aprovadoEm", aprovadoEm)
					.addValue("id", idOrcamento));
		} catch (DataAccessException exception) {
			throw new DefaultErrorException("Erro ao aprovar o orcamento.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public void rejeitarOrcamento(int idOrcamento, String observacoes) {
		String sql = """
				UPDATE orcamentos
				SET status = 'REJEITADO',
				    observacoes = :observacoes
				WHERE id = :id
				""";
		try {
			namedParameterJdbcTemplate.update(sql, new MapSqlParameterSource()
					.addValue("observacoes", observacoes)
					.addValue("id", idOrcamento));
		} catch (DataAccessException exception) {
			throw new DefaultErrorException("Erro ao rejeitar o orcamento.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public void reabrirOrcamento(int idOrcamento, String status, String observacoes) {
		String sql = """
				UPDATE orcamentos
				SET status = :status,
				    aprovado_em = NULL,
				    observacoes = :observacoes
				WHERE id = :id
				""";
		try {
			namedParameterJdbcTemplate.update(sql, new MapSqlParameterSource()
					.addValue("status", status)
					.addValue("observacoes", observacoes)
					.addValue("id", idOrcamento));
		} catch (DataAccessException exception) {
			throw new DefaultErrorException("Erro ao reabrir o orcamento.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public void cancelarManutencao(int idManutencao, String motivoCancelamento, String observacoes) {
		String sql = """
				UPDATE manutencao
				SET status_atendimento = 4,
				    motivo_cancelamento = :motivoCancelamento,
				    observacoes = :observacoes
				WHERE id = :id
				""";
		try {
			namedParameterJdbcTemplate.update(sql, new MapSqlParameterSource()
					.addValue("motivoCancelamento", motivoCancelamento)
					.addValue("observacoes", observacoes)
					.addValue("id", idManutencao));
		} catch (DataAccessException exception) {
			throw new DefaultErrorException("Erro ao cancelar a manutencao vinculada ao orcamento.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public void cancelarAvulso(int idAvulso, String motivoCancelamento, String observacoes) {
		String sql = """
				UPDATE avulsos
				SET status_atendimento = 4,
				    motivo_cancelamento = :motivoCancelamento,
				    observacoes = :observacoes
				WHERE id = :id
				""";
		try {
			namedParameterJdbcTemplate.update(sql, new MapSqlParameterSource()
					.addValue("motivoCancelamento", motivoCancelamento)
					.addValue("observacoes", observacoes)
					.addValue("id", idAvulso));
		} catch (DataAccessException exception) {
			throw new DefaultErrorException("Erro ao cancelar o avulso vinculado ao orcamento.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public Integer buscarVendaPorOrcamento(int idOrcamento) {
		try {
			return namedParameterJdbcTemplate.queryForObject(
					"SELECT id FROM vendas WHERE id_orcamento = :idOrcamento",
					new MapSqlParameterSource("idOrcamento", idOrcamento),
					Integer.class);
		} catch (EmptyResultDataAccessException exception) {
			return null;
		} catch (DataAccessException exception) {
			throw new DefaultErrorException("Erro ao consultar a venda do orcamento.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public VendaResponse buscarVendaPorId(int idVenda) {
		String sql = "SELECT * FROM vendas WHERE id = :idVenda";
		try {
			VendaResponse venda = namedParameterJdbcTemplate.queryForObject(sql,
					new MapSqlParameterSource("idVenda", idVenda),
					vendaMapper);
			venda.setItens(listarItensVenda(idVenda));
			List<ParcelaResponse> parcelas = listarParcelasVenda(idVenda);
			for (ParcelaResponse parcela : parcelas) {
				parcela.setPagamentos(listarPagamentosParcela(parcela.getId()));
			}
			venda.setParcelas(parcelas);
			return venda;
		} catch (EmptyResultDataAccessException exception) {
			throw new DefaultErrorException("Venda nao encontrada.", HttpStatus.NOT_FOUND);
		} catch (DataAccessException exception) {
			throw new DefaultErrorException("Erro ao consultar a venda.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public Map<String, Object> listarVendasPorPagina(int limit, int page, String pesquisa) {
		String filtro = buildLikeFilter(pesquisa);
		String sql = """
				SELECT *
				FROM vendas
				WHERE (:pesquisa IS NULL
				       OR UPPER(COALESCE(codigo, '')) LIKE :pesquisa
				       OR UPPER(COALESCE(cliente_nome, '')) LIKE :pesquisa
				       OR UPPER(COALESCE(cliente_documento, '')) LIKE :pesquisa
				       OR UPPER(COALESCE(origem_tipo, '')) LIKE :pesquisa
				       OR UPPER(COALESCE(status, '')) LIKE :pesquisa
				       OR UPPER(COALESCE(forma_pagamento, '')) LIKE :pesquisa)
				ORDER BY id DESC
				LIMIT :limit OFFSET :offset
				""";
		MapSqlParameterSource params = new MapSqlParameterSource()
				.addValue("pesquisa", filtro)
				.addValue("limit", limit)
				.addValue("offset", (page - 1) * limit);
		String sqlTotal = """
				SELECT COUNT(id)
				FROM vendas
				WHERE (:pesquisa IS NULL
				       OR UPPER(COALESCE(codigo, '')) LIKE :pesquisa
				       OR UPPER(COALESCE(cliente_nome, '')) LIKE :pesquisa
				       OR UPPER(COALESCE(cliente_documento, '')) LIKE :pesquisa
				       OR UPPER(COALESCE(origem_tipo, '')) LIKE :pesquisa
				       OR UPPER(COALESCE(status, '')) LIKE :pesquisa
				       OR UPPER(COALESCE(forma_pagamento, '')) LIKE :pesquisa)
				""";
		try {
			List<VendaResponse> lista = namedParameterJdbcTemplate.query(sql, params, vendaMapper);
			Integer total = namedParameterJdbcTemplate.queryForObject(sqlTotal,
					new MapSqlParameterSource("pesquisa", filtro), Integer.class);
			Map<String, Object> resultado = new HashMap<>();
			resultado.put("lista", lista);
			resultado.put("total", total);
			return resultado;
		} catch (DataAccessException exception) {
			throw new DefaultErrorException("Erro ao listar as vendas.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public void removerItensVenda(int idVenda) {
		String sql = "DELETE FROM venda_itens WHERE id_venda = :idVenda";
		try {
			namedParameterJdbcTemplate.update(sql, new MapSqlParameterSource("idVenda", idVenda));
		} catch (DataAccessException exception) {
			throw new DefaultErrorException("Erro ao atualizar itens da venda.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public void removerPagamentosVenda(int idVenda) {
		String sql = """
				DELETE p
				FROM pagamentos p
				INNER JOIN parcelas pa ON pa.id = p.id_parcela
				WHERE pa.id_venda = :idVenda
				""";
		try {
			namedParameterJdbcTemplate.update(sql, new MapSqlParameterSource("idVenda", idVenda));
			namedParameterJdbcTemplate.update("DELETE FROM pagamentos WHERE id_venda = :idVenda",
					new MapSqlParameterSource("idVenda", idVenda));
		} catch (DataAccessException exception) {
			throw new DefaultErrorException("Erro ao remover pagamentos da venda.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public void removerParcelasVenda(int idVenda) {
		String sql = "DELETE FROM parcelas WHERE id_venda = :idVenda";
		try {
			namedParameterJdbcTemplate.update(sql, new MapSqlParameterSource("idVenda", idVenda));
		} catch (DataAccessException exception) {
			throw new DefaultErrorException("Erro ao remover parcelas da venda.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public void atualizarResumoVenda(int idVenda, String clienteNome, String clienteDocumento, BigDecimal subtotal,
			BigDecimal totalDesconto, BigDecimal totalAcrescimo, BigDecimal totalGeral, String observacoes) {
		String sql = """
				UPDATE vendas
				SET cliente_nome = :clienteNome,
				    cliente_documento = :clienteDocumento,
				    subtotal = :subtotal,
				    total_desconto = :totalDesconto,
				    total_acrescimo = :totalAcrescimo,
				    total_geral = :totalGeral,
				    observacoes = :observacoes
				WHERE id = :id
				""";
		MapSqlParameterSource params = new MapSqlParameterSource()
				.addValue("clienteNome", clienteNome)
				.addValue("clienteDocumento", clienteDocumento)
				.addValue("subtotal", subtotal)
				.addValue("totalDesconto", totalDesconto)
				.addValue("totalAcrescimo", totalAcrescimo)
				.addValue("totalGeral", totalGeral)
				.addValue("observacoes", observacoes)
				.addValue("id", idVenda);
		try {
			namedParameterJdbcTemplate.update(sql, params);
		} catch (DataAccessException exception) {
			throw new DefaultErrorException("Erro ao consolidar a venda.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public void atualizarVenda(int idVenda, String clienteNome, String clienteDocumento, String formaPagamento,
			int quantidadeParcelas, BigDecimal subtotal, BigDecimal totalDesconto, BigDecimal totalAcrescimo,
			BigDecimal totalGeral, String observacoes) {
		String sql = """
				UPDATE vendas
				SET cliente_nome = :clienteNome,
				    cliente_documento = :clienteDocumento,
				    forma_pagamento = :formaPagamento,
				    quantidade_parcelas = :quantidadeParcelas,
				    subtotal = :subtotal,
				    total_desconto = :totalDesconto,
				    total_acrescimo = :totalAcrescimo,
				    total_geral = :totalGeral,
				    observacoes = :observacoes
				WHERE id = :id
				""";
		MapSqlParameterSource params = new MapSqlParameterSource()
				.addValue("clienteNome", clienteNome)
				.addValue("clienteDocumento", clienteDocumento)
				.addValue("formaPagamento", formaPagamento)
				.addValue("quantidadeParcelas", quantidadeParcelas)
				.addValue("subtotal", subtotal)
				.addValue("totalDesconto", totalDesconto)
				.addValue("totalAcrescimo", totalAcrescimo)
				.addValue("totalGeral", totalGeral)
				.addValue("observacoes", observacoes)
				.addValue("id", idVenda);
		try {
			namedParameterJdbcTemplate.update(sql, params);
		} catch (DataAccessException exception) {
			throw new DefaultErrorException("Erro ao atualizar a venda.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public List<CaixaResumoPagamentoResponse> listarResumoCaixaDia(LocalDate dataReferencia) {
		String sql = """
				SELECT p.forma_pagamento,
				       SUM(p.valor_pago) AS valor_total,
				       SUM(p.valor_pago) AS valor_recebido,
				       CASE WHEN COUNT(p.valor_entregue)=COUNT(*) THEN SUM(p.valor_entregue) ELSE NULL END AS valor_entregue,
				       CASE WHEN COUNT(p.troco)=COUNT(*) THEN SUM(p.troco) ELSE NULL END AS troco
				FROM pagamentos p
				INNER JOIN parcelas pa ON pa.id = p.id_parcela
				INNER JOIN vendas v ON v.id = pa.id_venda
				WHERE DATE(p.data_pagamento) = :dataReferencia
				GROUP BY p.forma_pagamento
				ORDER BY p.forma_pagamento
				""";
		try {
			return namedParameterJdbcTemplate.query(sql,
					new MapSqlParameterSource("dataReferencia", dataReferencia),
					caixaResumoPagamentoMapper);
		} catch (DataAccessException exception) {
			throw new DefaultErrorException("Erro ao consultar o resumo do caixa do dia.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public List<CaixaFechamentoResponse> listarFechamentosCaixa() {
		String sql = """
				SELECT id, data_referencia, fechado_em, valor_total, valor_informado, valor_quebra, observacoes
				FROM caixa_fechamentos
				ORDER BY data_referencia DESC, id DESC
				""";
		try {
			List<CaixaFechamentoResponse> fechamentos = namedParameterJdbcTemplate.query(sql, caixaFechamentoMapper);
			for (CaixaFechamentoResponse fechamento : fechamentos) {
				fechamento.setItens(listarItensFechamentoCaixa(fechamento.getId()));
			}
			return fechamentos;
		} catch (DataAccessException exception) {
			throw new DefaultErrorException("Erro ao consultar os fechamentos do caixa.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public CaixaFechamentoResponse salvarFechamentoCaixa(LocalDate dataReferencia, BigDecimal valorTotal,
			BigDecimal valorInformado, BigDecimal valorQuebra, String observacoes) {
		Integer existente = buscarFechamentoCaixaPorData(dataReferencia);
		if (existente == null) {
			KeyHolder keyHolder = new GeneratedKeyHolder();
			String insertSql = """
					INSERT INTO caixa_fechamentos (
						data_referencia, status, fechado_em, valor_total, valor_informado, valor_quebra, observacoes
					) VALUES (
						:dataReferencia, 'FECHADO', NOW(), :valorTotal, :valorInformado, :valorQuebra, :observacoes
					)
					""";
			try {
				namedParameterJdbcTemplate.update(insertSql, new MapSqlParameterSource()
						.addValue("dataReferencia", dataReferencia)
						.addValue("valorTotal", valorTotal)
						.addValue("valorInformado", valorInformado)
						.addValue("valorQuebra", valorQuebra)
						.addValue("observacoes", observacoes), keyHolder, new String[] { "id" });
				existente = keyHolder.getKey().intValue();
			} catch (DataAccessException exception) {
				throw new DefaultErrorException("Erro ao salvar o fechamento do caixa.", HttpStatus.INTERNAL_SERVER_ERROR);
			}
		} else {
			String updateSql = """
					UPDATE caixa_fechamentos
					SET status = 'FECHADO',
					    fechado_em = NOW(),
					    valor_total = :valorTotal,
					    valor_informado = :valorInformado,
					    valor_quebra = :valorQuebra,
					    observacoes = :observacoes
					WHERE id = :id
					""";
			try {
				namedParameterJdbcTemplate.update(updateSql, new MapSqlParameterSource()
						.addValue("id", existente)
						.addValue("valorTotal", valorTotal)
						.addValue("valorInformado", valorInformado)
						.addValue("valorQuebra", valorQuebra)
						.addValue("observacoes", observacoes));
			} catch (DataAccessException exception) {
				throw new DefaultErrorException("Erro ao atualizar o fechamento do caixa.", HttpStatus.INTERNAL_SERVER_ERROR);
			}
		}

		return buscarFechamentoCaixa(existente);
	}

	public void substituirItensFechamentoCaixa(int idFechamento, List<CaixaResumoPagamentoResponse> itens) {
		try {
			namedParameterJdbcTemplate.update("DELETE FROM caixa_fechamento_itens WHERE id_caixa_fechamento = :id",
					new MapSqlParameterSource("id", idFechamento));
			String insertSql = """
					INSERT INTO caixa_fechamento_itens (
						id_caixa_fechamento, forma_pagamento, valor_total, quantidade_lancamentos, valor_entregue, troco
					) VALUES (
						:idFechamento, :formaPagamento, :valorTotal, :quantidadeLancamentos, :valorEntregue, :troco
					)
					""";
			for (CaixaResumoPagamentoResponse item : itens) {
				namedParameterJdbcTemplate.update(insertSql, new MapSqlParameterSource()
						.addValue("idFechamento", idFechamento)
						.addValue("formaPagamento", item.getForma_pagamento())
						.addValue("valorTotal", item.getValor_recebido())
						.addValue("valorEntregue", item.getValor_entregue())
						.addValue("troco", item.getTroco())
						.addValue("quantidadeLancamentos", item.getValor_recebido() != null
								&& item.getValor_recebido().compareTo(BigDecimal.ZERO) > 0 ? 1 : 0));
			}
		} catch (DataAccessException exception) {
			throw new DefaultErrorException("Erro ao salvar os itens do fechamento do caixa.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public List<CaixaResumoPagamentoResponse> listarItensFechamentoCaixa(int idFechamento) {
		String sql = """
				SELECT forma_pagamento,
				       valor_total,
				       valor_total AS valor_recebido, valor_entregue, troco
				FROM caixa_fechamento_itens
				WHERE id_caixa_fechamento = :idFechamento
				ORDER BY forma_pagamento
				""";
		try {
			return namedParameterJdbcTemplate.query(sql,
					new MapSqlParameterSource("idFechamento", idFechamento),
					caixaResumoPagamentoMapper);
		} catch (DataAccessException exception) {
			throw new DefaultErrorException("Erro ao consultar os itens do fechamento do caixa.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public List<OrcamentoItemResponse> listarItensVenda(int idVenda) {
		String sql = """
				SELECT id, tipo_item, id_produto, id_servico, descricao, quantidade, valor_unitario,
				       percentual_desconto, valor_desconto, valor_total, 1 AS ordem, criado_em, atualizado_em
				FROM venda_itens
				WHERE id_venda = :idVenda
				ORDER BY id ASC
				""";
		try {
			return namedParameterJdbcTemplate.query(sql, new MapSqlParameterSource("idVenda", idVenda), orcamentoItemMapper);
		} catch (DataAccessException exception) {
			throw new DefaultErrorException("Erro ao consultar itens da venda.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public List<ParcelaResponse> listarParcelasVenda(int idVenda) {
		String sql = "SELECT * FROM parcelas WHERE id_venda = :idVenda ORDER BY numero_parcela ASC";
		try {
			return namedParameterJdbcTemplate.query(sql, new MapSqlParameterSource("idVenda", idVenda), parcelaMapper);
		} catch (DataAccessException exception) {
			throw new DefaultErrorException("Erro ao consultar parcelas da venda.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public List<PagamentoResponse> listarPagamentosParcela(int idParcela) {
		String sql = "SELECT * FROM pagamentos WHERE id_parcela = :idParcela ORDER BY data_pagamento ASC, id ASC";
		try {
			return namedParameterJdbcTemplate.query(sql, new MapSqlParameterSource("idParcela", idParcela), pagamentoMapper);
		} catch (DataAccessException exception) {
			throw new DefaultErrorException("Erro ao consultar pagamentos da parcela.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public void registrarEventoOutbox(String aggregateType, long aggregateId, String eventType, Map<String, Object> payload) {
		String sql = """
				INSERT INTO outbox_eventos (
					aggregate_type, aggregate_id, event_type, payload, status, tentativas, disponivel_em
				) VALUES (
					:aggregateType, :aggregateId, :eventType, CAST(:payload AS JSON), 'PENDENTE', 0, NOW()
				)
				""";
		try {
			namedParameterJdbcTemplate.update(sql, new MapSqlParameterSource()
					.addValue("aggregateType", aggregateType)
					.addValue("aggregateId", aggregateId)
					.addValue("eventType", eventType)
					.addValue("payload", objectMapper.writeValueAsString(payload)));
		} catch (JsonProcessingException exception) {
			throw new DefaultErrorException("Erro ao serializar evento.", HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (DataAccessException exception) {
			throw new DefaultErrorException("Erro ao registrar evento na outbox.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public List<OutboxEventoDTO> listarEventosPendentes(int limite) {
		int limiteNormalizado = Math.max(1, limite);
		String sql = """
				SELECT id, aggregate_type, aggregate_id, event_type, CAST(payload AS CHAR) AS payload_json, tentativas, criado_em
				FROM outbox_eventos
				WHERE status = 'PENDENTE' AND disponivel_em <= NOW()
				ORDER BY id ASC
				LIMIT %d
				""";
		try {
			return namedParameterJdbcTemplate.query(sql.formatted(limiteNormalizado), (rs, rowNum) -> {
				try {
					return mapOutboxEvento(rs, rowNum);
				} catch (IOException e) {					
					e.printStackTrace();
					throw new DefaultErrorException("Erro ao consultar eventos pendentes.", HttpStatus.INTERNAL_SERVER_ERROR);
				}
			});
		} catch (DataAccessException exception) {
			exception.printStackTrace();
			throw new DefaultErrorException("Erro ao consultar eventos pendentes.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public void marcarEventoProcessado(long id) {
		String sql = """
				UPDATE outbox_eventos
				SET status = 'PROCESSADO',
				    tentativas = tentativas + 1,
				    processado_em = NOW(),
				    erro = NULL
				WHERE id = :id
				""";
		namedParameterJdbcTemplate.update(sql, new MapSqlParameterSource("id", id));
	}

	public void registrarFalhaEvento(long id, String erro) {
		String sql = """
				UPDATE outbox_eventos
				SET tentativas = tentativas + 1,
				    erro = :erro,
				    disponivel_em = DATE_ADD(NOW(), INTERVAL 1 MINUTE)
				WHERE id = :id
				""";
		namedParameterJdbcTemplate.update(sql, new MapSqlParameterSource()
				.addValue("id", id)
				.addValue("erro", erro));
	}

	private OutboxEventoDTO mapOutboxEvento(ResultSet rs, int rowNum) throws SQLException, IOException {
		try {
			return OutboxEventoDTO.builder()
					.id(rs.getLong("id"))
					.aggregateType(rs.getString("aggregate_type"))
					.aggregateId(rs.getLong("aggregate_id"))
					.eventType(rs.getString("event_type"))
					.payload(readPayloadNode(rs.getObject("payload_json")))
					.tentativas(rs.getInt("tentativas"))
					.criadoEm(getLocalDateTime(rs, "criado_em"))
					.build();
		} catch (JsonProcessingException exception) {
			throw new SQLException("Falha ao desserializar payload da outbox.", exception);
		}
	}

	private JsonNode readPayloadNode(Object payloadValue) throws IOException {
		if (payloadValue == null) {
			return objectMapper.createObjectNode();
		}
		if (payloadValue instanceof byte[] bytes) {
			return objectMapper.readTree(bytes);
		}
		if (payloadValue instanceof String payloadString) {
			return objectMapper.readTree(payloadString);
		}
		return objectMapper.valueToTree(payloadValue);
	}

	private LocalDateTime getLocalDateTime(ResultSet rs, String column) throws SQLException {
		return rs.getTimestamp(column) != null ? rs.getTimestamp(column).toLocalDateTime() : null;
	}

	private String normalizeOrigem(String origemTipo) {
		if (origemTipo == null) {
			return "";
		}
		return origemTipo.trim().toUpperCase();
	}

	private String buildLikeFilter(String pesquisa) {
		if (pesquisa == null || pesquisa.trim().isEmpty()) {
			return null;
		}
		return "%" + pesquisa.trim().toUpperCase() + "%";
	}

	private Integer buscarFechamentoCaixaPorData(LocalDate dataReferencia) {
		try {
			return namedParameterJdbcTemplate.queryForObject(
					"SELECT id FROM caixa_fechamentos WHERE data_referencia = :dataReferencia",
					new MapSqlParameterSource("dataReferencia", dataReferencia),
					Integer.class);
		} catch (EmptyResultDataAccessException exception) {
			return null;
		} catch (DataAccessException exception) {
			throw new DefaultErrorException("Erro ao consultar fechamento do caixa.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	private CaixaFechamentoResponse buscarFechamentoCaixa(int idFechamento) {
		String sql = """
				SELECT id, data_referencia, fechado_em, valor_total, valor_informado, valor_quebra, observacoes
				FROM caixa_fechamentos
				WHERE id = :idFechamento
				""";
		try {
			CaixaFechamentoResponse fechamento = namedParameterJdbcTemplate.queryForObject(sql,
					new MapSqlParameterSource("idFechamento", idFechamento),
					caixaFechamentoMapper);
			fechamento.setItens(listarItensFechamentoCaixa(idFechamento));
			return fechamento;
		} catch (EmptyResultDataAccessException exception) {
			throw new DefaultErrorException("Fechamento do caixa nao encontrado.", HttpStatus.NOT_FOUND);
		} catch (DataAccessException exception) {
			throw new DefaultErrorException("Erro ao consultar fechamento do caixa.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
