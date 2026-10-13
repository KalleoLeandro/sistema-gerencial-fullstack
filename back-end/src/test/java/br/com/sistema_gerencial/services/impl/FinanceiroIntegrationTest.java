package br.com.sistema_gerencial.services.impl;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import static br.com.sistema_gerencial.models.financeiro.FinanceiroModels.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.*;
import org.junit.jupiter.api.*;
import org.springframework.aop.framework.ProxyFactory;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.annotation.AnnotationTransactionAttributeSource;
import org.springframework.transaction.interceptor.TransactionInterceptor;
import com.fasterxml.jackson.databind.ObjectMapper;
import br.com.sistema_gerencial.support.DatabaseTestSupport;
import br.com.sistema_gerencial.repositories.*;

class FinanceiroIntegrationTest extends DatabaseTestSupport {
    FinanceiroRepository repository;
    FluxoComercialRepository comercial;
    FinanceiroService service;
    final LocalDate hoje=LocalDate.now();
    final Filtro todos=new Filtro(null,null,null,null,null,null);

    @BeforeEach void setup() {
        repository=new FinanceiroRepository(namedJdbc);
        comercial=spy(new FluxoComercialRepository(namedJdbc,new ObjectMapper()));
        var interceptor=new TransactionInterceptor();
        interceptor.setTransactionManager(new DataSourceTransactionManager(jdbc.getDataSource()));
        interceptor.setTransactionAttributeSource(new AnnotationTransactionAttributeSource());
        var proxy=new ProxyFactory(new FinanceiroService(repository,comercial));proxy.addAdvice(interceptor);
        service=(FinanceiroService)proxy.getProxy();
    }
    ContaRequest request(String tipo,String descricao,String valor,LocalDate data) {
        return new ContaRequest(tipo,descricao,"Pessoa teste","Operação","REF",data,new BigDecimal(valor),null,null);
    }
    Conta criar(String tipo,String valor,LocalDate data) { return service.criar(request(tipo,"Conta teste",valor,data)); }
    BaixaRequest baixa(String valor) { return new BaixaRequest(hoje,new BigDecimal(valor),"PIX","Observação"); }
    void venda() {
        jdbc.update("INSERT INTO vendas(id,codigo,origem_tipo,cliente_nome,total_geral) VALUES(1,'V-1','PDV','Cliente venda',200)");
        jdbc.update("INSERT INTO parcelas(id,id_venda,numero_parcela,data_vencimento,valor_previsto,saldo_aberto) VALUES(1,1,1,?,100,100)",hoje.minusDays(1));
        jdbc.update("INSERT INTO parcelas(id,id_venda,numero_parcela,data_vencimento,valor_previsto,saldo_aberto) VALUES(2,1,2,?,100,100)",hoje.plusDays(5));
    }
    @Test void listaIntegraParcelasSemDuplicarContas() {
        venda();criar("PAGAR","50",hoje);
        var page=service.listar(todos,1,10);
        assertThat(page.total()).isEqualTo(3);
        assertThat(page.lista()).extracting(Conta::origem).containsExactly("VENDA","MANUAL","VENDA");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM financeiro_contas",Integer.class)).isEqualTo(1);
        assertThat(service.listar(new Filtro("RECEBER",null,null,null,null,null),1,10).total()).isEqualTo(2);
    }
    @Test void baixaParcialETotalAtualizamSaldoHistoricoEStatus() {
        var conta=criar("PAGAR","100",hoje.plusDays(1));
        var parcial=service.baixar("MANUAL",conta.id(),baixa("30"));
        assertThat(parcial.conta().status()).isEqualTo("PARCIAL");
        assertThat(parcial.conta().saldo()).isEqualByComparingTo("70");
        var finalizada=service.baixar("MANUAL",conta.id(),baixa("70"));
        assertThat(finalizada.conta().status()).isEqualTo("QUITADA");
        assertThat(finalizada.baixas()).hasSize(2);
        assertThat(finalizada.baixas().getFirst().formaPagamento()).isEqualTo("PIX");
        assertThatThrownBy(()->service.baixar("MANUAL",conta.id(),baixa("1"))).hasMessageContaining("excede");
    }
    @Test void identificaVencidaMesmoComBaixaParcial() {
        var conta=criar("RECEBER","100",hoje.minusDays(2));
        assertThat(conta.status()).isEqualTo("VENCIDA");
        service.baixar("MANUAL",conta.id(),baixa("20"));
        assertThat(service.detalhes("MANUAL",conta.id()).conta().status()).isEqualTo("VENCIDA");
    }
    @Test void pagamentoDaVendaAtualizaParcelaCaixaEOutbox() {
        venda();var result=service.baixar("VENDA",1,baixa("40"));
        assertThat(result.conta().saldo()).isEqualByComparingTo("60");
        assertThat(result.conta().valorBaixado()).isEqualByComparingTo("40");
        assertThat(jdbc.queryForObject("SELECT valor_pago FROM pagamentos WHERE id_parcela=1",BigDecimal.class)).isEqualByComparingTo("40");
        assertThat(jdbc.queryForObject("SELECT event_type FROM outbox_eventos",String.class)).isEqualTo("PAGAMENTO_REGISTRADO");
        assertThat(service.relatorio(todos).resumo().recebido()).isEqualByComparingTo("40");
    }
    @Test void falhaDuranteBaixaRevertePagamentoDaVenda() {
        venda();doThrow(new IllegalStateException("falha de gravação")).when(comercial).atualizarParcelaAposPagamento(anyInt(),any(),any(),anyString(),any());
        assertThatThrownBy(()->service.baixar("VENDA",1,baixa("40"))).hasMessageContaining("falha");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM pagamentos",Integer.class)).isZero();
        assertThat(service.detalhes("VENDA",1).conta().saldo()).isEqualByComparingTo("100");
    }
    @Test void duasBaixasConcorrentesNaoUltrapassamSaldo() throws Exception {
        var conta=criar("RECEBER","100",hoje.plusDays(1));
        try(var executor=Executors.newFixedThreadPool(2)) {
            var start=new CountDownLatch(1);
            Callable<Boolean> tarefa=()->{start.await();try {service.baixar("MANUAL",conta.id(),baixa("80"));return true;}catch(br.com.sistema_gerencial.exceptions.DefaultErrorException e){return false;}};
            var a=executor.submit(tarefa);var b=executor.submit(tarefa);start.countDown();
            assertThat(List.of(a.get(10,TimeUnit.SECONDS),b.get(10,TimeUnit.SECONDS))).containsExactlyInAnyOrder(true,false);
        }
        assertThat(service.detalhes("MANUAL",conta.id()).conta().saldo()).isEqualByComparingTo("20");
    }
    @Test void relatorioDistingueDataDaBaixaEVencimento() {
        var pagar=criar("PAGAR","100",hoje.plusDays(30));
        var receber=criar("RECEBER","200",hoje.plusDays(30));
        service.baixar("MANUAL",pagar.id(),baixa("40"));service.baixar("MANUAL",receber.id(),baixa("50"));
        var fluxo=service.relatorio(new Filtro(null,null,null,hoje,hoje,null));
        assertThat(fluxo.resumo().pago()).isEqualByComparingTo("40");
        assertThat(fluxo.resumo().recebido()).isEqualByComparingTo("50");
        assertThat(fluxo.resumo().saldoRealizado()).isEqualByComparingTo("10");
        assertThat(fluxo.previsto()).isEmpty();
        var futuro=service.relatorio(new Filtro(null,null,null,hoje.plusDays(30),hoje.plusDays(30),null));
        assertThat(futuro.resumo().saldoPrevisto()).isEqualByComparingTo("90");
        assertThat(futuro.realizado()).isEmpty();assertThat(futuro.previsto()).hasSize(1);
    }
    @Test void cancelamentoPreservaHistoricoEExcluiPrevisao() {
        var conta=criar("PAGAR","100",hoje);service.cancelar(conta.id());
        assertThat(service.detalhes("MANUAL",conta.id()).conta().status()).isEqualTo("CANCELADA");
        assertThat(service.relatorio(todos).resumo().aPagar()).isEqualByComparingTo("0");
        assertThat(service.relatorio(todos).previsto()).isEmpty();
        assertThatThrownBy(()->service.baixar("MANUAL",conta.id(),baixa("20"))).hasMessageContaining("canceladas");
        assertThatThrownBy(()->service.atualizar(conta.id(),request("PAGAR","Outra","100",hoje))).hasMessageContaining("canceladas");
    }
    @Test void contaComBaixaNaoPodeSerCanceladaOuReduzidaAbaixoDoPago() {
        var conta=criar("PAGAR","100",hoje);service.baixar("MANUAL",conta.id(),baixa("50"));
        assertThatThrownBy(()->service.cancelar(conta.id())).hasMessageContaining("com baixas");
        assertThatThrownBy(()->service.atualizar(conta.id(),request("PAGAR","Outra","49",hoje))).hasMessageContaining("inferior");
        assertThatThrownBy(()->service.atualizar(conta.id(),request("RECEBER","Outra","100",hoje))).hasMessageContaining("tipo");
        var updated=service.atualizar(conta.id(),request("PAGAR","Outra","150",hoje.plusDays(10)));
        assertThat(updated.saldo()).isEqualByComparingTo("100");assertThat(updated.descricao()).isEqualTo("Outra");
    }
    @Test void filtrosPesquisaCategoriaStatusPeriodoEPaginacao() {
        criar("PAGAR","100",hoje.minusDays(1));criar("RECEBER","100",hoje.plusDays(1));
        var filtro=service.filtro("PAGAR","VENCIDA","pessoa",hoje.minusDays(1),hoje,"Operação");
        assertThat(service.listar(filtro,1,10).total()).isEqualTo(1);
        assertThat(service.listar(todos,2,1).lista()).hasSize(1);
        assertThat(service.listar(service.filtro(null,null,"inexistente",null,null,null),1,10).total()).isZero();
        assertThat(service.relatorio(new Filtro("PAGAR",null,null,null,null,"Outra")).resumo().aPagar()).isEqualByComparingTo("0");
    }
    @Test void resumoSeparaVencidosPagosERecebidos() {
        var pagar=criar("PAGAR","100",hoje.minusDays(1));var receber=criar("RECEBER","200",hoje.minusDays(1));
        service.baixar("MANUAL",pagar.id(),baixa("20"));service.baixar("MANUAL",receber.id(),baixa("40"));
        var resumo=service.relatorio(todos).resumo();
        assertThat(resumo.pagarVencido()).isEqualByComparingTo("80");
        assertThat(resumo.receberVencido()).isEqualByComparingTo("160");
        assertThat(service.relatorio(new Filtro("PAGAR",null,null,null,null,"Operação")).resumo().recebido()).isEqualByComparingTo("0");
    }
    @Test void naoAceitaBaixasFuturasEParametrosInvalidos() {
        var conta=criar("PAGAR","100",hoje);
        assertThatThrownBy(()->service.baixar("MANUAL",conta.id(),new BaixaRequest(hoje.plusDays(1),BigDecimal.ONE,"PIX",null))).hasMessageContaining("futuro");
        assertThatThrownBy(()->service.filtro("INVALIDO",null,null,null,null,null)).hasMessageContaining("Tipo");
        assertThatThrownBy(()->service.filtro(null,"INVALIDO",null,null,null,null)).hasMessageContaining("Status");
        assertThatThrownBy(()->service.filtro(null,null,null,hoje,hoje.minusDays(1),null)).hasMessageContaining("inicial");
        assertThatThrownBy(()->service.listar(todos,0,10)).hasMessageContaining("Página");
        assertThatThrownBy(()->service.listar(todos,1,101)).hasMessageContaining("limite");
        assertThatThrownBy(()->service.detalhes("INVALIDO",1)).hasMessageContaining("Origem");
        assertThatThrownBy(()->service.detalhes("MANUAL",999)).hasMessageContaining("encontrada");
    }
    @Test void referenciaGenericaOpcionalExigeParTipoId() {
        var request=new ContaRequest("PAGAR","Contrato","Parceiro",null,null,hoje,new BigDecimal("100"),"CONTRATO",25L);
        var conta=service.criar(request);assertThat(conta.entidadeTipo()).isEqualTo("CONTRATO");assertThat(conta.entidadeId()).isEqualTo(25);
        assertThatThrownBy(()->service.criar(new ContaRequest("PAGAR","X","Y",null,null,hoje,BigDecimal.ONE,"CONTRATO",null))).hasMessageContaining("juntos");
    }
}
