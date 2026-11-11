package br.com.sistema_gerencial.controllers;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import br.com.sistema_gerencial.services.*;
import br.com.sistema_gerencial.models.response.*;

class CadastroOperacoesControllerHttpTest {
    @Test void produtoEServicoFiltramAtivosEFalta() throws Exception {
        var products=mock(ProdutoService.class); var services=mock(ServicoService.class);
        when(products.listarAtivos()).thenReturn(List.of(ProdutoResponse.builder().id(7).build()));
        when(products.listarEmFalta()).thenReturn(List.of(ProdutoResponse.builder().id(8).build()));
        when(services.listarAtivos()).thenReturn(List.of(ServicoResponse.builder().id(9).build()));
        var mvc=MockMvcBuilders.standaloneSetup(new ProdutoController(products),new ServicoController(services)).build();
        mvc.perform(get("/produtos/listar-ativos")).andExpect(status().isOk()).andExpect(jsonPath("$[0].id").value(7));
        mvc.perform(get("/produtos/listar-em-falta")).andExpect(status().isOk()).andExpect(jsonPath("$[0].id").value(8));
        mvc.perform(get("/servicos/listar-ativos")).andExpect(status().isOk()).andExpect(jsonPath("$[0].id").value(9));
        verify(products).listarAtivos(); verify(products).listarEmFalta(); verify(services).listarAtivos();
    }
    @Test void empresaPesquisaInfraestruturaERenovacao() throws Exception {
        var service=mock(EmpresaService.class); var mvc=MockMvcBuilders.standaloneSetup(new EmpresaController(service)).build();
        when(service.listarPorPaginaENome(10,1,"Ana")).thenReturn(Map.of("total",1,"lista",List.of()));
        when(service.listarRenovacoes(7)).thenReturn(List.of(RenovacaoContratoResponse.builder().id(1).build()));
        mvc.perform(get("/empresa/listar-por-nome").param("limit","10").param("page","1").param("nome","Ana"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.total").value(1));
        mvc.perform(post("/empresa/salvar-infra/7").contentType(MediaType.TEXT_PLAIN).content("Rede" )).andExpect(status().isNoContent());
        mvc.perform(post("/empresa/renovar-contrato/7").contentType(MediaType.APPLICATION_JSON).content("{}" )).andExpect(status().isNoContent());
        mvc.perform(get("/empresa/listar-renovacoes/7")).andExpect(status().isOk()).andExpect(jsonPath("$[0].id").value(1));
        verify(service).salvarInfraestrutura("Rede",7); verify(service).renovarContrato(eq(7),any()); verify(service).listarPorPaginaENome(10,1,"Ana");
    }
    @Test void statusEPesquisaDeChamados() throws Exception {
        var atendimento=mock(AtendimentoService.class); var manutencao=mock(ManutencaoService.class); var avulso=mock(AvulsoService.class);
        var mvc=MockMvcBuilders.standaloneSetup(new AntendimentoController(atendimento),new ManutencaoController(manutencao),new AvulsoController(avulso)).build();
        for(String type:List.of("atendimento","manutencao","avulso")) mvc.perform(put("/"+type+"/alterar-status").param("id","7").param("status","4")
                .contentType(MediaType.APPLICATION_JSON).content("{\"motivo_cancelamento\":\"Cliente solicitou\"}")).andExpect(status().isNoContent());
        verify(atendimento).alterarStatus(7,4,"Cliente solicitou"); verify(manutencao).alterarStatus(7,4,"Cliente solicitou"); verify(avulso).alterarStatus(7,4,"Cliente solicitou");
        when(manutencao.listarPorEmpresa(10,1,7)).thenReturn(Map.of("total",1));
        mvc.perform(get("/manutencao/listar-por-cliente").param("limit","10").param("page","1").param("id_empresa","7"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.total").value(1));
        when(avulso.listarPorAtributoEPagina(10,1,"Ana","nome")).thenReturn(Map.of("total",1));
        mvc.perform(get("/avulso/listar-com-pesquisa").param("limit","10").param("page","1").param("pesquisa","Ana").param("tipoConsulta","nome"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.total").value(1));
    }
}
