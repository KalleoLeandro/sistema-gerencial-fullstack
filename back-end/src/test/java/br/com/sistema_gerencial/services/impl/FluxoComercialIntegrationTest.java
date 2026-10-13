package br.com.sistema_gerencial.services.impl;

import static org.assertj.core.api.Assertions.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import com.fasterxml.jackson.databind.ObjectMapper;
import br.com.sistema_gerencial.support.DatabaseTestSupport;
import br.com.sistema_gerencial.repositories.FluxoComercialRepository;
import br.com.sistema_gerencial.models.requests.*;
import br.com.sistema_gerencial.models.response.*;
import br.com.sistema_gerencial.exceptions.DefaultErrorException;

class FluxoComercialIntegrationTest extends DatabaseTestSupport {
    FluxoComercialRepository repository;
    FluxoComercialServiceImpl service;
    static BigDecimal money(String value) { return new BigDecimal(value); }

    @BeforeEach void setup() {
        repository = new FluxoComercialRepository(namedJdbc, new ObjectMapper());
        service = new FluxoComercialServiceImpl(repository);
        seedOrigins();
    }

    static OrcamentoItemRequest item(String value) {
        var item = new OrcamentoItemRequest();
        item.setTipo_item(" servico "); item.setDescricao(" Instalacao ");
        item.setQuantidade(money("1")); item.setValor_unitario(money(value));
        return item;
    }
    OrcamentoResponse budget(String value) {
        var created = service.criarOrcamento(null);
        var edit = new AtualizarItensOrcamentoRequest(); edit.setId_orcamento(created.getId());
        edit.setCliente_nome("Ana"); edit.setItens(List.of(item(value)));
        return service.atualizarItens(edit);
    }
    AprovarOrcamentoRequest approval(int id) {
        var request = new AprovarOrcamentoRequest(); request.setId_orcamento(id); return request;
    }
    PagamentoVendaRequest payment(String value) {
        var request = new PagamentoVendaRequest(); request.setValor_pago(money(value));
        request.setForma_pagamento("PIX"); return request;
    }

    @ParameterizedTest @ValueSource(strings={"ATENDIMENTO","MANUTENCAO","AVULSO"})
    void geraOrcamentoUmaVezEVinculaOrigem(String origin) {
        service.gerarOrcamentoParaOrigem(origin,1); service.gerarOrcamentoParaOrigem(origin,1);
        var found = service.buscarOrcamentoPorOrigem(origin,1);
        assertThat(found.getOrigem_tipo()).isEqualTo(origin);
        assertThat(found.getCliente_nome()).isNotBlank();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM orcamentos",Integer.class)).isEqualTo(1);
        assertThat(repository.listarEventosPendentes(100)).hasSize(1);
    }

    @Test void criaOrcamentoManualEPdvComDadosNormalizados() {
        var request = new CriarOrcamentoRequest(); request.setCliente_nome(" Ana ");
        request.setCliente_documento(" 123 "); request.setObservacoes(" Nota ");
        var manual=service.criarOrcamento(request);
        assertThat(manual.getCliente_nome()).isEqualTo("Ana");
        assertThat(manual.getCliente_documento()).isEqualTo("123");
        assertThat(manual.getObservacoes()).isEqualTo("Nota");
        assertThat(service.criarOrcamentoPdv(null).getCliente_nome()).isEqualTo("Consumidor final");
        var pdv=new CriarOrcamentoPdvRequest(); pdv.setCliente_nome(" Bia "); pdv.setObservacoes(" balcão ");
        assertThat(service.criarOrcamentoPdv(pdv).getCliente_nome()).isEqualTo("Bia");
        request.setOrigem_tipo("ATENDIMENTO"); request.setOrigem_id(1);
        assertThat(service.criarOrcamento(request).getId_atendimento()).isEqualTo(1);
    }

    @Test void calculaDescontosAcrescimosEArredondamento() {
        var created=service.criarOrcamentoPdv(null);
        var product=item("10.005"); product.setQuantidade(money("2")); product.setPercentual_desconto(money("10"));
        var request=new AtualizarItensOrcamentoRequest(); request.setId_orcamento(created.getId());
        request.setCliente_nome(" Ana "); request.setItens(Arrays.asList(null,product));
        request.setDesconto_financeiro(money("1")); request.setAcrescimo_financeiro(money("3"));
        var result=service.atualizarItens(request);
        assertThat(result.getCodigo()).isEqualTo("PDV-%06d".formatted(created.getId()));
        assertThat(result.getSubtotal()).isEqualByComparingTo("18.02");
        assertThat(result.getTotal_desconto()).isEqualByComparingTo("3.00");
        assertThat(result.getTotal_geral()).isEqualByComparingTo("20.02");
        assertThat(result.getStatus()).isEqualTo("EM_ANALISE");
        assertThat(result.getItens().getFirst().getDescricao()).isEqualTo("Instalacao");
        assertThat(result.getItens().getFirst().getOrdem()).isEqualTo(2);
    }

    @Test void divideParcelasSemPerderCentavosEPermiteAprovacaoIdempotente() {
        var budget=budget("100"); var request=approval(budget.getId());
        request.setQuantidade_parcelas(3); request.setIntervalo_dias(15);
        request.setData_primeiro_vencimento(LocalDate.of(2026,10,1));
        var sale=service.aprovarOrcamento(request);
        assertThat(sale.getParcelas()).extracting(ParcelaResponse::getValor_previsto)
                .containsExactly(money("33.33"),money("33.33"),money("33.34"));
        assertThat(sale.getParcelas().get(2).getData_vencimento()).isEqualTo(LocalDate.of(2026,10,31));
        assertThat(service.aprovarOrcamento(request).getId()).isEqualTo(sale.getId());
        assertThat(service.buscarOrcamentoPorId(budget.getId()).getStatus()).isEqualTo("APROVADO");
    }

    @Test void registraPagamentoParcialEQuitacaoNaAprovacao() {
        var budget=budget("100"); var request=approval(budget.getId());
        request.setQuantidade_parcelas(0); request.setIntervalo_dias(0);
        request.setPagamentos(List.of(payment("40"), payment("60")));
        var sale=service.aprovarOrcamento(request); var parcel=sale.getParcelas().getFirst();
        assertThat(parcel.getStatus()).isEqualTo("PAGA");
        assertThat(parcel.getValor_pago()).isEqualByComparingTo("100");
        assertThat(parcel.getSaldo_aberto()).isEqualByComparingTo("0");
        assertThat(parcel.getPagamentos()).hasSize(2);
    }

    @ParameterizedTest @ValueSource(strings={"0","-1","101"})
    void impedePagamentosInvalidos(String value) {
        var request=approval(budget("100").getId()); request.setPagamentos(List.of(payment(value)));
        assertThatThrownBy(()->service.aprovarOrcamento(request)).isInstanceOf(DefaultErrorException.class)
                .hasMessageContaining(value.equals("101") ? "excede" : "maior que zero");
    }

    @ParameterizedTest @ValueSource(strings={"ATENDIMENTO","MANUTENCAO","AVULSO"})
    void rejeicaoZeraValorNaOrigemECancelaServicos(String origin) {
        service.gerarOrcamentoParaOrigem(origin,1); var budget=service.buscarOrcamentoPorOrigem(origin,1);
        var edit=new AtualizarItensOrcamentoRequest(); edit.setId_orcamento(budget.getId());
        edit.setCliente_nome("Ana"); edit.setItens(List.of(item("25"))); service.atualizarItens(edit);
        var reject=new RejeitarOrcamentoRequest(); reject.setId_orcamento(budget.getId()); reject.setMotivo(" Preco ");
        assertThat(service.rejeitarOrcamento(reject).getStatus()).isEqualTo("REJEITADO");
        assertThat(service.rejeitarOrcamento(reject).getObservacoes()).contains("Preco");
        String table=origin.equals("MANUTENCAO")?"manutencao":origin.equals("AVULSO")?"avulsos":"atendimentos";
        assertThat(jdbc.queryForObject("SELECT valor_orcamento FROM "+table+" WHERE id=1",BigDecimal.class)).isEqualByComparingTo("0");
        if (!origin.equals("ATENDIMENTO")) assertThat(jdbc.queryForObject("SELECT status_atendimento FROM "+table+" WHERE id=1",Integer.class)).isEqualTo(4);
        var reopen=new ReabrirOrcamentoRequest(); reopen.setId_orcamento(budget.getId());
        if (origin.equals("ATENDIMENTO")) assertThat(service.reabrirOrcamento(reopen).getStatus()).isEqualTo("EM_ANALISE");
        else assertThatThrownBy(()->service.reabrirOrcamento(reopen)).isInstanceOf(DefaultErrorException.class);
    }

    @Test void reabreAtendimentoSemItensEIgnoraOrcamentoNaoRejeitado() {
        service.gerarOrcamentoParaOrigem("ATENDIMENTO",1); var budget=service.buscarOrcamentoPorOrigem("ATENDIMENTO",1);
        var reopen=new ReabrirOrcamentoRequest(); reopen.setId_orcamento(budget.getId());
        assertThat(service.reabrirOrcamento(reopen).getStatus()).isEqualTo("ABERTO");
        var reject=new RejeitarOrcamentoRequest(); reject.setId_orcamento(budget.getId()); service.rejeitarOrcamento(reject);
        assertThat(service.reabrirOrcamento(reopen).getStatus()).isEqualTo("ABERTO");
    }

    @Test void impedeAprovarSemItensEAlterarRejeitado() {
        var budget=service.criarOrcamento(null);
        assertThatThrownBy(()->service.aprovarOrcamento(approval(budget.getId()))).hasMessageContaining("ao menos um item");
        var reject=new RejeitarOrcamentoRequest(); reject.setId_orcamento(budget.getId()); service.rejeitarOrcamento(reject);
        var edit=new AtualizarItensOrcamentoRequest(); edit.setId_orcamento(budget.getId());
        assertThatThrownBy(()->service.atualizarItens(edit)).hasMessageContaining("rejeitados");
    }

    @Test void atualizaVendaEReconstroiPagamentos() {
        var sale=service.aprovarOrcamento(approval(budget("100").getId()));
        var update=new AtualizarVendaRequest(); update.setId_venda(sale.getId()); update.setCliente_nome(" Bia ");
        update.setForma_pagamento(" pix "); update.setItens(List.of(item("80")));
        update.setPagamentos(List.of(payment("30"),payment("50")));
        var updated=service.atualizarVenda(update);
        assertThat(updated.getCliente_nome()).isEqualTo("Bia");
        assertThat(updated.getForma_pagamento()).isEqualTo("PIX");
        assertThat(updated.getTotal_geral()).isEqualByComparingTo("80");
        assertThat(updated.getParcelas()).hasSize(1);
        assertThat(updated.getParcelas().getFirst().getPagamentos()).hasSize(2);
        assertThat(updated.getParcelas().getFirst().getStatus()).isEqualTo("PAGA");
    }

    @Test void impedeVendaComPagamentosDivergentes() {
        var sale=service.aprovarOrcamento(approval(budget("100").getId()));
        var request=new AtualizarVendaRequest(); request.setId_venda(sale.getId()); request.setItens(List.of(item("100")));
        assertThatThrownBy(()->service.atualizarVenda(request)).hasMessageContaining("igual ao total");
    }

    @Test void fechamentoCalculaQuebraEConferenciaPorFormaDePagamento() {
        var request=approval(budget("100").getId()); request.setPagamentos(List.of(payment("100"))); service.aprovarOrcamento(request);
        assertThat(service.buscarResumoCaixaDia().getResumo()).hasSize(1);
        var close=new FecharCaixaRequest(); close.setValor_informado(money("95"));
        var result=service.fecharCaixa(close);
        assertThat(result.getValor_total()).isEqualByComparingTo("100");
        assertThat(result.getValor_quebra()).isEqualByComparingTo("-5");
        var counted=new FecharCaixaItemRequest(); counted.setForma_pagamento(" pix "); counted.setValor_informado(money("100"));
        close.setItens(Arrays.asList(null,counted)); result=service.fecharCaixa(close);
        assertThat(result.getValor_quebra()).isEqualByComparingTo("0");
        assertThat(result.getItens().getFirst().getForma_pagamento()).isEqualTo("PIX");
        assertThat(service.buscarResumoCaixaDia().getFechamentos()).isNotEmpty();
    }

    @Test void caixaVazioEValoresNegativos() {
        assertThat(service.fecharCaixa(null).getValor_total()).isEqualByComparingTo("0");
        var request=new FecharCaixaRequest(); request.setValor_informado(money("-1"));
        assertThatThrownBy(()->service.fecharCaixa(request)).hasMessageContaining("negativo");
        var counted=new FecharCaixaItemRequest(); counted.setValor_informado(money("-1")); request.setItens(List.of(counted));
        assertThatThrownBy(()->service.fecharCaixa(request)).hasMessageContaining("negativo");
    }

    @Test void paginacaoPesquisaENaoEncontrados() {
        budget("100"); budget("50");
        assertThat(service.listarOrcamentosPorPagina(0,0," ana ").get("total")).isEqualTo(2);
        assertThat((List<?>)service.listarOrcamentosPorPagina(1,2,null).get("lista")).hasSize(1);
        assertThat(service.listarOrcamentosPorPagina(200,1,"inexistente").get("total")).isEqualTo(0);
        assertThat(service.listarVendasPorPagina(0,0,null).get("total")).isEqualTo(0);
        assertThatThrownBy(()->service.buscarOrcamentoPorId(999)).hasMessageContaining("nao encontrado");
        assertThatThrownBy(()->service.buscarVendaPorId(999)).hasMessageContaining("nao encontrada");
        assertThatThrownBy(()->service.buscarOrcamentoPorOrigem("ATENDIMENTO",999)).hasMessageContaining("nao encontrado");
        assertThatThrownBy(()->repository.buscarOrigem("INVALIDO",1)).isInstanceOf(DefaultErrorException.class);
        assertThatThrownBy(()->repository.buscarOrigem("ATENDIMENTO",999)).isInstanceOf(DefaultErrorException.class);
    }

    @Test void armazenaValorEntregueTrocoEFechamentoConferePeloLiquido() {
        var request=approval(budget("80").getId());
        var payment=payment("80");payment.setForma_pagamento("DINHEIRO");payment.setValor_entregue(money("100"));request.setPagamentos(List.of(payment));
        var venda=service.aprovarOrcamento(request);
        var persistido=venda.getParcelas().getFirst().getPagamentos().getFirst();
        assertThat(persistido.getValor_entregue()).isEqualByComparingTo("100");assertThat(persistido.getTroco()).isEqualByComparingTo("20");
        var resumo=repository.listarResumoCaixaDia(LocalDate.now()).getFirst();
        assertThat(resumo.getValor_entregue()).isEqualByComparingTo("100");assertThat(resumo.getTroco()).isEqualByComparingTo("20");
        assertThat(resumo.getValor_recebido()).isEqualByComparingTo("80");
        var fechar=new FecharCaixaRequest();fechar.setValor_informado(money("80"));
        var fechamento=service.fecharCaixa(fechar);
        assertThat(fechamento.getValor_quebra()).isEqualByComparingTo("0");
        assertThat(fechamento.getItens().getFirst().getTroco()).isEqualByComparingTo("20");
        assertThat(repository.listarFechamentosCaixa().getFirst().getItens().getFirst().getValor_entregue()).isEqualByComparingTo("100");
    }
    @Test void pagamentoMistoPreservaTrocoSemInflarReceita() {
        var request=approval(budget("100").getId());
        var pix=payment("30");var dinheiro=payment("70");dinheiro.setForma_pagamento("DINHEIRO");dinheiro.setValor_entregue(money("100"));
        request.setPagamentos(List.of(pix,dinheiro));service.aprovarOrcamento(request);
        var resumo=repository.listarResumoCaixaDia(LocalDate.now());
        assertThat(resumo.stream().map(CaixaResumoPagamentoResponse::getValor_recebido).reduce(BigDecimal.ZERO,BigDecimal::add)).isEqualByComparingTo("100");
        assertThat(resumo.stream().map(CaixaResumoPagamentoResponse::getTroco).reduce(BigDecimal.ZERO,BigDecimal::add)).isEqualByComparingTo("30");
    }
    @Test void rejeitaTrocoForaDeDinheiroEEntregaMenorQuePagamento() {
        var request=approval(budget("80").getId());var payment=payment("80");payment.setValor_entregue(money("100"));request.setPagamentos(List.of(payment));
        assertThatThrownBy(()->service.aprovarOrcamento(request)).hasMessageContaining("dinheiro");
        var outro=approval(budget("80").getId());payment.setForma_pagamento("DINHEIRO");payment.setValor_entregue(money("79"));outro.setPagamentos(List.of(payment));
        assertThatThrownBy(()->service.aprovarOrcamento(outro)).hasMessageContaining("menor");
    }
    @Test void trocoHistoricoDesconhecidoNaoEhApresentadoComoZero() {
        var request=approval(budget("80").getId());request.setPagamentos(List.of(payment("80")));service.aprovarOrcamento(request);
        jdbc.update("UPDATE pagamentos SET valor_entregue=NULL,troco=NULL");
        var resumo=repository.listarResumoCaixaDia(LocalDate.now()).getFirst();
        assertThat(resumo.getTroco()).isNull();assertThat(resumo.getValor_entregue()).isNull();assertThat(resumo.getValor_recebido()).isEqualByComparingTo("80");
    }
}
