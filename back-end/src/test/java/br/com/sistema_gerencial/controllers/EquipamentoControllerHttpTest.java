package br.com.sistema_gerencial.controllers;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.junit.jupiter.api.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import java.util.*;
import br.com.sistema_gerencial.services.EquipamentoService;
import br.com.sistema_gerencial.models.requests.*;
import br.com.sistema_gerencial.models.response.EquipamentoResponse;
import br.com.sistema_gerencial.exceptions.*;

class EquipamentoControllerHttpTest {
    EquipamentoService service; MockMvc mvc;
    @BeforeEach void setup() {
        service=mock(EquipamentoService.class);
        mvc=MockMvcBuilders.standaloneSetup(new EquipamentoController(service))
                .setControllerAdvice(new GlobalExceptionHandler()).build();
    }
    @Test void cadastroDeserializaCamposERetornaCriado() throws Exception {
        
        mvc.perform(post("/equipamento/cadastrar").contentType(MediaType.APPLICATION_JSON)
                .content("{\"nome_maquina\":\"Teste\"}")).andExpect(status().isCreated());
        verify(service).cadastrar(argThat(request->"Teste".equals(request.getNome_maquina())));
    }
    @Test void listaRespeitaPaginacaoERetornaTotal() throws Exception {
        when(service.listarPorPagina(10,2,1)).thenReturn(Map.of("lista",List.of(),"total",5));
        mvc.perform(get("/equipamento/listar").param("limit","10").param("page","2").param("id_empresa","1"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.total").value(5)).andExpect(jsonPath("$.lista").isEmpty());
        verify(service).listarPorPagina(10,2,1);
    }
    @Test void consultaEResposta404() throws Exception {
        when(service.buscarPorId(7)).thenReturn(EquipamentoResponse.builder().id(7).build());
        mvc.perform(get("/equipamento/buscar-por-id/7")).andExpect(status().isOk()).andExpect(jsonPath("$.id").value(7));
        when(service.buscarPorId(8)).thenThrow(new DefaultErrorException("Registro nao encontrado",HttpStatus.NOT_FOUND));
        mvc.perform(get("/equipamento/buscar-por-id/8")).andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404)).andExpect(jsonPath("$.message").value("Registro nao encontrado"));
    }
    @Test void atualizacaoEExclusaoRetornamSemConteudo() throws Exception {
        mvc.perform(put("/equipamento/atualizar").contentType(MediaType.APPLICATION_JSON)
                .content("{\"id\":7,\"nome_maquina\":\"Atualizado\"}")).andExpect(status().isNoContent()).andExpect(content().string(""));
        verify(service).atualizar(argThat(request->request.getId()==7));
        mvc.perform(delete("/equipamento/excluir/7")).andExpect(status().isNoContent()); verify(service).excluir(7);
    }
    @Test void corpoMalformadoEPaginacaoAusenteRetornam400() throws Exception {
        mvc.perform(post("/equipamento/cadastrar").contentType(MediaType.APPLICATION_JSON).content("{")).andExpect(status().isBadRequest());
        mvc.perform(get("/equipamento/listar")).andExpect(status().isBadRequest()); verifyNoInteractions(service);
    }
}

