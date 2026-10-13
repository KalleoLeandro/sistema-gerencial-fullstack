package br.com.sistema_gerencial.services.impl;

import static org.assertj.core.api.Assertions.*;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.*;
import org.springframework.aop.framework.ProxyFactory;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.annotation.AnnotationTransactionAttributeSource;
import org.springframework.transaction.interceptor.TransactionInterceptor;
import com.fasterxml.jackson.databind.ObjectMapper;
import br.com.sistema_gerencial.support.DatabaseTestSupport;
import br.com.sistema_gerencial.repositories.FluxoComercialRepository;
import br.com.sistema_gerencial.services.FluxoComercialService;
import br.com.sistema_gerencial.models.requests.*;
import br.com.sistema_gerencial.models.response.*;

/** Uses the same annotation-driven transactions as the application, with real JDBC. */
class FluxoComercialTransactionTest extends DatabaseTestSupport {
    FluxoComercialService service;
    @BeforeEach void setup() {
        var repository=new FluxoComercialRepository(namedJdbc,new ObjectMapper());
        var manager=new DataSourceTransactionManager(jdbc.getDataSource());
        var interceptor=new TransactionInterceptor(); interceptor.setTransactionManager(manager);
        interceptor.setTransactionAttributeSource(new AnnotationTransactionAttributeSource());
        var proxy=new ProxyFactory(new FluxoComercialServiceImpl(repository)); proxy.addAdvice(interceptor);
        service=(FluxoComercialService)proxy.getProxy();
    }
    OrcamentoResponse budget() {
        var created=service.criarOrcamento(null); var request=new AtualizarItensOrcamentoRequest(); request.setId_orcamento(created.getId());
        request.setCliente_nome("Ana"); request.setItens(List.of(FluxoComercialIntegrationTest.item("100")));
        return service.atualizarItens(request);
    }
    @Test void pagamentoInvalidoReverteVendaParcelasEventosEAprovacao() {
        var budget=budget(); var request=new AprovarOrcamentoRequest(); request.setId_orcamento(budget.getId());
        var payment=new PagamentoVendaRequest(); payment.setValor_pago(new BigDecimal("101")); request.setPagamentos(List.of(payment));
        int events=jdbc.queryForObject("SELECT COUNT(*) FROM outbox_eventos",Integer.class);
        assertThatThrownBy(()->service.aprovarOrcamento(request)).hasMessageContaining("excede");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM vendas",Integer.class)).isZero();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM parcelas",Integer.class)).isZero();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM pagamentos",Integer.class)).isZero();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM outbox_eventos",Integer.class)).isEqualTo(events);
        assertThat(service.buscarOrcamentoPorId(budget.getId()).getStatus()).isEqualTo("EM_ANALISE");
    }
    @Test void pagamentosDivergentesNaoApagamItensDaVendaExistente() {
        var request=new AprovarOrcamentoRequest(); request.setId_orcamento(budget().getId()); var sale=service.aprovarOrcamento(request);
        var update=new AtualizarVendaRequest(); update.setId_venda(sale.getId()); update.setItens(List.of(FluxoComercialIntegrationTest.item("200")));
        assertThatThrownBy(()->service.atualizarVenda(update)).hasMessageContaining("igual ao total");
        var persisted=service.buscarVendaPorId(sale.getId());
        assertThat(persisted.getTotal_geral()).isEqualByComparingTo("100");
        assertThat(persisted.getItens()).hasSize(1);
        assertThat(persisted.getItens().getFirst().getValor_total()).isEqualByComparingTo("100");
        assertThat(persisted.getParcelas()).hasSize(1);
    }
}
