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
import br.com.sistema_gerencial.services.ProdutoService;
import br.com.sistema_gerencial.models.requests.*;
import br.com.sistema_gerencial.models.response.ProdutoResponse;
import br.com.sistema_gerencial.exceptions.*;

class ProdutoControllerHttpTest {
    ProdutoService service; MockMvc mvc;
    @BeforeEach void setup() {
        service=mock(ProdutoService.class);
        mvc=MockMvcBuilders.standaloneSetup(new ProdutoController(service))
                .setControllerAdvice(new GlobalExceptionHandler()).build();
    }
    @Test void cadastroDeserializaCamposERetornaCriado() throws Exception {
        when(service.cadastrar(any())).thenReturn(42);
        mvc.perform(post("/produtos/cadastrar").contentType(MediaType.APPLICATION_JSON)
                .content("{\"nome\":\"Teste\"}")).andExpect(status().isCreated()).andExpect(content().string("42"));
        verify(service).cadastrar(argThat(request->"Teste".equals(request.getNome())));
    }
    @Test void listaRespeitaPaginacaoERetornaTotal() throws Exception {
        when(service.listarPorPagina(10,2)).thenReturn(Map.of("lista",List.of(),"total",5));
        mvc.perform(get("/produtos/listar").param("limit","10").param("page","2"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.total").value(5)).andExpect(jsonPath("$.lista").isEmpty());
        verify(service).listarPorPagina(10,2);
    }
    @Test void consultaEResposta404() throws Exception {
        when(service.buscarPorId(7)).thenReturn(ProdutoResponse.builder().id(7).build());
        mvc.perform(get("/produtos/buscar-por-id/7")).andExpect(status().isOk()).andExpect(jsonPath("$.id").value(7));
        when(service.buscarPorId(8)).thenThrow(new DefaultErrorException("Registro nao encontrado",HttpStatus.NOT_FOUND));
        mvc.perform(get("/produtos/buscar-por-id/8")).andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404)).andExpect(jsonPath("$.message").value("Registro nao encontrado"));
    }
    @Test void atualizacaoEExclusaoRetornamSemConteudo() throws Exception {
        mvc.perform(put("/produtos/atualizar").contentType(MediaType.APPLICATION_JSON)
                .content("{\"id\":7,\"nome\":\"Atualizado\"}")).andExpect(status().isNoContent()).andExpect(content().string(""));
        verify(service).atualizar(argThat(request->request.getId()==7));
        mvc.perform(delete("/produtos/excluir/7")).andExpect(status().isNoContent()); verify(service).excluir(7);
    }
    @Test void corpoMalformadoEPaginacaoAusenteRetornam400() throws Exception {
        mvc.perform(post("/produtos/cadastrar").contentType(MediaType.APPLICATION_JSON).content("{")).andExpect(status().isBadRequest());
        mvc.perform(get("/produtos/listar")).andExpect(status().isBadRequest()); verifyNoInteractions(service);
    }
}

