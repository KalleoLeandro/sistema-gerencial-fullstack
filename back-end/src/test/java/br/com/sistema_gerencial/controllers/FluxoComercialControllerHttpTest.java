package br.com.sistema_gerencial.controllers;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import java.util.*;
import org.junit.jupiter.api.*;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import br.com.sistema_gerencial.services.FluxoComercialService;
import br.com.sistema_gerencial.models.response.*;
import br.com.sistema_gerencial.exceptions.GlobalExceptionHandler;

class FluxoComercialControllerHttpTest {
    FluxoComercialService service; MockMvc mvc;
    @BeforeEach void setup() {
        service=mock(FluxoComercialService.class);
        mvc=MockMvcBuilders.standaloneSetup(new OrcamentoController(service),new VendaController(service),new CaixaController(service))
                .setControllerAdvice(new GlobalExceptionHandler()).build();
    }
    @Test void criaOrcamentosComESemCorpo() throws Exception {
        when(service.criarOrcamento(any())).thenReturn(OrcamentoResponse.builder().id(1).build());
        when(service.criarOrcamento(null)).thenReturn(OrcamentoResponse.builder().id(1).build());
        when(service.criarOrcamentoPdv(any())).thenReturn(OrcamentoResponse.builder().id(2).build());
        mvc.perform(post("/orcamentos/criar")).andExpect(status().isCreated()).andExpect(jsonPath("$.id").value(1));
        verify(service).criarOrcamento(null);
        mvc.perform(post("/orcamentos/criar-pdv").contentType(MediaType.APPLICATION_JSON).content("{\"cliente_nome\":\"Ana\"}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.id").value(2));
        verify(service).criarOrcamentoPdv(argThat(req->"Ana".equals(req.getCliente_nome())));
    }
    @Test void consultaOrcamentosPorIdOrigemEPagina() throws Exception {
        var budget=OrcamentoResponse.builder().id(7).status("ABERTO").build();
        when(service.buscarOrcamentoPorId(7)).thenReturn(budget); when(service.buscarOrcamentoPorOrigem("ATENDIMENTO",2)).thenReturn(budget);
        when(service.listarOrcamentosPorPagina(10,1,"Ana")).thenReturn(Map.of("lista",List.of(budget),"total",1));
        mvc.perform(get("/orcamentos/buscar-por-id/7")).andExpect(status().isOk()).andExpect(jsonPath("$.id").value(7));
        mvc.perform(get("/orcamentos/buscar-por-origem").param("origemTipo","ATENDIMENTO").param("origemId","2"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(7));
        mvc.perform(get("/orcamentos/listar").param("limit","10").param("page","1").param("pesquisa","Ana"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.total").value(1));
        verify(service).listarOrcamentosPorPagina(10,1,"Ana");
    }
    @Test void atualizaItensRejeitaEReabre() throws Exception {
        var budget=OrcamentoResponse.builder().id(7).build();
        when(service.atualizarItens(any())).thenReturn(budget); when(service.rejeitarOrcamento(any())).thenReturn(budget); when(service.reabrirOrcamento(any())).thenReturn(budget);
        for(String path:List.of("atualizar-itens","rejeitar","reabrir")) mvc.perform(put("/orcamentos/"+path).contentType(MediaType.APPLICATION_JSON).content("{\"id_orcamento\":7}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(7));
        verify(service).atualizarItens(argThat(req->req.getId_orcamento()==7));
        verify(service).rejeitarOrcamento(argThat(req->req.getId_orcamento()==7)); verify(service).reabrirOrcamento(argThat(req->req.getId_orcamento()==7));
    }
    @Test void aprovaAtualizaEConsultaVendas() throws Exception {
        var sale=VendaResponse.builder().id(8).build(); when(service.aprovarOrcamento(any())).thenReturn(sale);
        when(service.atualizarVenda(any())).thenReturn(sale); when(service.buscarVendaPorId(8)).thenReturn(sale);
        when(service.listarVendasPorPagina(10,1,"Ana")).thenReturn(Map.of("total",1,"lista",List.of(sale)));
        mvc.perform(post("/vendas/aprovar-orcamento").contentType(MediaType.APPLICATION_JSON).content("{\"id_orcamento\":7}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.id").value(8));
        mvc.perform(put("/vendas/atualizar").contentType(MediaType.APPLICATION_JSON).content("{\"id_venda\":8}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(8));
        mvc.perform(get("/vendas/buscar-por-id/8")).andExpect(status().isOk()).andExpect(jsonPath("$.id").value(8));
        mvc.perform(get("/vendas/listar").param("limit","10").param("page","1").param("pesquisa","Ana"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.total").value(1));
        verify(service).aprovarOrcamento(argThat(req->req.getId_orcamento()==7)); verify(service).atualizarVenda(argThat(req->req.getId_venda()==8));
    }
    @Test void resumoEFechamentoCaixa() throws Exception {
        when(service.buscarResumoCaixaDia()).thenReturn(CaixaResumoDiaResponse.builder().resumo(List.of()).build());
        when(service.fecharCaixa(any())).thenReturn(CaixaFechamentoResponse.builder().id(9).build());
        mvc.perform(get("/caixa/resumo-dia")).andExpect(status().isOk()).andExpect(jsonPath("$.resumo").isEmpty());
        mvc.perform(post("/caixa/fechar").contentType(MediaType.APPLICATION_JSON).content("{\"valor_informado\":100}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(9));
        verify(service).fecharCaixa(argThat(req->req.getValor_informado().intValue()==100));
    }
}
