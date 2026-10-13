package br.com.sistema_gerencial.services.impl;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.math.BigDecimal;
import java.util.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.*;
import br.com.sistema_gerencial.models.requests.*;
import br.com.sistema_gerencial.models.response.*;
import br.com.sistema_gerencial.repositories.FluxoComercialRepository;
import br.com.sistema_gerencial.exceptions.DefaultErrorException;

class FluxoComercialValidationTest {
    FluxoComercialRepository repository;
    FluxoComercialServiceImpl service;
    @BeforeEach void setup() {
        repository=mock(FluxoComercialRepository.class); service=new FluxoComercialServiceImpl(repository);
    }
    @ParameterizedTest @ValueSource(strings={"descricao","tipo","quantidadeNula","quantidadeZero","quantidadeNegativa","preco","percentualNegativo","percentualMaior","desconto"})
    void rejeitaItemInvalidoAntesDePersistir(String invalid) {
        when(repository.buscarOrcamentoPorId(1)).thenReturn(OrcamentoResponse.builder().id(1).status("ABERTO").build());
        var item=FluxoComercialIntegrationTest.item("100");
        switch(invalid) {
            case "descricao" -> item.setDescricao(" ");
            case "tipo" -> item.setTipo_item(null);
            case "quantidadeNula" -> item.setQuantidade(null);
            case "quantidadeZero" -> item.setQuantidade(BigDecimal.ZERO);
            case "quantidadeNegativa" -> item.setQuantidade(BigDecimal.valueOf(-1));
            case "preco" -> item.setValor_unitario(BigDecimal.valueOf(-1));
            case "percentualNegativo" -> item.setPercentual_desconto(BigDecimal.valueOf(-1));
            case "percentualMaior" -> item.setPercentual_desconto(BigDecimal.valueOf(101));
            case "desconto" -> item.setValor_desconto(BigDecimal.valueOf(101));
        }
        var request=new AtualizarItensOrcamentoRequest(); request.setId_orcamento(1); request.setItens(List.of(item));
        assertThatThrownBy(()->service.atualizarItens(request)).isInstanceOf(DefaultErrorException.class);
        verify(repository,never()).removerItensOrcamento(anyInt());
        verify(repository,never()).registrarEventoOutbox(anyString(),anyLong(),anyString(),anyMap());
    }
    @Test void rejeitaTotalNegativoSemAlterarItens() {
        when(repository.buscarOrcamentoPorId(1)).thenReturn(OrcamentoResponse.builder().status("ABERTO").build());
        var request=new AtualizarItensOrcamentoRequest(); request.setId_orcamento(1); request.setDesconto_financeiro(BigDecimal.TEN);
        assertThatThrownBy(()->service.atualizarItens(request)).hasMessageContaining("negativo");
        verify(repository,never()).removerItensOrcamento(anyInt());
    }
    @ParameterizedTest @ValueSource(strings={"APROVADO","REJEITADO","EM_ANALISE"})
    void impedeAprovacaoDuplicadaOuRejeitada(String status) {
        when(repository.buscarOrcamentoPorId(1)).thenReturn(OrcamentoResponse.builder().id(1).status(status)
                .itens(List.of(OrcamentoItemResponse.builder().build())).build());
        when(repository.buscarVendaPorOrcamento(1)).thenReturn(status.equals("EM_ANALISE") ? 10 : null);
        var request=new AprovarOrcamentoRequest(); request.setId_orcamento(1);
        assertThatThrownBy(()->service.aprovarOrcamento(request)).isInstanceOf(DefaultErrorException.class);
        verify(repository,never()).inserirVenda(any(),any(),any(),anyInt(),any());
    }
    @Test void naoRejeitaOrcamentoAprovado() {
        when(repository.buscarOrcamentoPorId(1)).thenReturn(OrcamentoResponse.builder().id(1).status("APROVADO").build());
        var request=new RejeitarOrcamentoRequest(); request.setId_orcamento(1);
        assertThatThrownBy(()->service.rejeitarOrcamento(request)).hasMessageContaining("aprovados");
        verify(repository,never()).rejeitarOrcamento(anyInt(),any());
    }
}
