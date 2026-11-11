package br.com.sistema_gerencial.services.impl;

import static br.com.sistema_gerencial.models.financeiro.FinanceiroModels.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import br.com.sistema_gerencial.exceptions.DefaultErrorException;
import br.com.sistema_gerencial.repositories.FinanceiroRepository;
import br.com.sistema_gerencial.repositories.FluxoComercialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import java.time.Clock;

/**
 * Valida e executa operações de contas a pagar e a receber, incluindo baixas e relatórios financeiros.
 */
@Service
public class FinanceiroService {
    private final FinanceiroRepository repository;
    private final FluxoComercialRepository comercial;
    private final Clock clock;

    @Autowired
    public FinanceiroService(FinanceiroRepository repository, FluxoComercialRepository comercial, Clock clock) {
        this.repository=repository;this.comercial=comercial;
        this.clock=clock;
    }

    public FinanceiroService(FinanceiroRepository repository, FluxoComercialRepository comercial) {
        this(repository,comercial,Clock.system(ZoneId.of("America/Sao_Paulo")));
    }


    public Filtro filtro(String tipo,String status,String pesquisa,LocalDate inicio,LocalDate fim,String categoria) {
        tipo=limpar(tipo);status=limpar(status);
        if(tipo!=null && !List.of("PAGAR","RECEBER").contains(tipo)) throw erro("Tipo de conta inválido.");
        if(status!=null && !List.of("ABERTA","PARCIAL","VENCIDA","QUITADA","CANCELADA").contains(status)) throw erro("Status inválido.");
        if(inicio!=null && fim!=null && inicio.isAfter(fim)) throw erro("A data inicial deve ser anterior ou igual à data final.");
        return new Filtro(tipo,status,limpar(pesquisa),inicio,fim,limpar(categoria));
    }
    private String limpar(String s) { return s==null||s.isBlank()?null:s.trim(); }
    private void origem(String origem) { if(!List.of("MANUAL","VENDA").contains(origem)) throw erro("Origem inválida."); }
    private DefaultErrorException erro(String mensagem) { return new DefaultErrorException(mensagem,HttpStatus.BAD_REQUEST); }

    @Transactional(readOnly=true)
    public Pagina listar(Filtro filtro,int page,int limit) {
        if(page<1 || limit<1 || limit>100) throw erro("Página e limite inválidos (máximo de 100 itens).");
        return repository.listar(filtro,page,limit);
    }
    @Transactional(readOnly=true)
    public Detalhes detalhes(String origem,long id) { return new Detalhes(conta(origem,id),repository.baixas(origem,id)); }
    private Conta conta(String origem,long id) {
        origem(origem);var conta=repository.buscar(origem,id);
        if(conta==null) throw new DefaultErrorException("Conta não encontrada.",HttpStatus.NOT_FOUND);
        return conta;
    }

    @Transactional
    public Conta criar(ContaRequest request) {
        validarReferencia(request);
        return conta("MANUAL",repository.criar(request));
    }
    private void validarReferencia(ContaRequest r) {
        if((limpar(r.entidadeTipo())==null)!=(r.entidadeId()==null)) throw erro("Informe o tipo e o identificador da entidade juntos.");
    }
    @Transactional
    public Conta atualizar(long id,ContaRequest request) {
        repository.bloquear("MANUAL",id);var atual=conta("MANUAL",id);
        if("CANCELADA".equals(atual.status())) throw erro("Contas canceladas não podem ser editadas.");
        if(!atual.tipo().equals(request.tipo())) throw erro("O tipo da conta não pode ser alterado.");
        if(request.valor().compareTo(atual.valorBaixado())<0) throw erro("O valor da conta não pode ser inferior ao valor já baixado.");
        validarReferencia(request);repository.atualizar(id,request);return conta("MANUAL",id);
    }
    @Transactional
    public void cancelar(long id) {
        repository.bloquear("MANUAL",id);var atual=conta("MANUAL",id);
        if(atual.valorBaixado().signum()>0) throw erro("Uma conta com baixas não pode ser cancelada.");
        repository.cancelar(id);
    }
    @Transactional
    public Detalhes baixar(String origem,long id,BaixaRequest request) {
        origem(origem);repository.bloquear(origem,id);var atual=conta(origem,id);
        if("CANCELADA".equals(atual.status())) throw erro("Contas canceladas não podem receber baixa.");
        if(request.data().isAfter(LocalDate.now(clock))) throw erro("A data da baixa não pode estar no futuro.");
        if(request.valor().compareTo(atual.saldo())>0) throw erro("O valor da baixa excede o saldo da conta.");
        if("MANUAL".equals(origem)) repository.baixarManual(id,request);
        else {
            var data=request.data().atStartOfDay();var novoPago=atual.valorBaixado().add(request.valor());
            var saldo=atual.saldo().subtract(request.valor());
            comercial.inserirPagamento(Math.toIntExact(id),"FIN-"+UUID.randomUUID().toString().substring(0,20),data,
                request.formaPagamento().trim(),request.valor(),request.observacoes());
            comercial.atualizarParcelaAposPagamento(Math.toIntExact(id),novoPago,saldo,saldo.signum()==0?"PAGA":"PARCIAL",data);
            comercial.registrarEventoOutbox("PAGAMENTO",id,"PAGAMENTO_REGISTRADO",Map.of("vendaId",atual.vendaId(),"parcelaId",id,"valorPago",request.valor(),"saldoAberto",saldo));
        }
        return detalhes(origem,id);
    }
    @Transactional(readOnly=true)
    public Relatorio relatorio(Filtro filtro) {
        var realizado=repository.realizado(filtro);
        var entradas=realizado.stream().map(Fluxo::entradas).reduce(BigDecimal.ZERO,BigDecimal::add);
        var saidas=realizado.stream().map(Fluxo::saidas).reduce(BigDecimal.ZERO,BigDecimal::add);
        return new Relatorio(repository.resumo(filtro,saidas,entradas),realizado,repository.previsto(filtro));
    }
}
