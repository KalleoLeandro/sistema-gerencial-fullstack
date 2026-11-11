package br.com.sistema_gerencial.controllers;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.bson.types.Binary;
import br.com.sistema_gerencial.services.*;
import br.com.sistema_gerencial.models.response.*;
import br.com.sistema_gerencial.models.mongo.ImagemDocumento;

class ImagemClienteControllerHttpTest {
    @Test void uploadListaConteudoBinarioEExclusao() throws Exception {
        var service=mock(ImagemService.class); var mvc=MockMvcBuilders.standaloneSetup(new ImagemController(service)).build();
        var file=new MockMultipartFile("arquivo","foto.png","image/png",new byte[]{1,2,3});
        when(service.salvar(eq("PRODUTO"),eq(7),eq("EXIBICAO"),eq(true),any())).thenReturn(ImagemResponse.builder().id("image").build());
        when(service.listar("PRODUTO",7,null)).thenReturn(List.of(ImagemResponse.builder().id("image").build()));
        when(service.buscarConteudo("image")).thenReturn(ImagemDocumento.builder().id("image").nomeArquivo("foto.png").contentType("image/png").conteudo(new Binary(new byte[]{1,2,3})).build());
        mvc.perform(multipart("/imagens/upload").file(file).param("entityType","PRODUTO").param("entityId","7").param("categoria","EXIBICAO").param("principal","true"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.id").value("image"));
        mvc.perform(get("/imagens/listar").param("entityType","PRODUTO").param("entityId","7"))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].id").value("image"));
        mvc.perform(get("/imagens/image/conteudo")).andExpect(status().isOk()).andExpect(content().bytes(new byte[]{1,2,3}))
                .andExpect(content().contentType("image/png")).andExpect(header().string("Cache-Control","no-cache"))
                .andExpect(header().string("Content-Disposition","inline; filename=\"foto.png\""));
        mvc.perform(delete("/imagens/image")).andExpect(status().isNoContent()); verify(service).excluir("image");
    }
    @ParameterizedTest @ValueSource(strings={"found","empty","null"})
    void buscaClientesRetorna200Ou204(String scenario) throws Exception {
        var service=mock(ClienteService.class); var mvc=MockMvcBuilders.standaloneSetup(new ClienteController(service)).build();
        var client=ClienteResponse.builder().id(7).nome("Ana").build(); boolean found=scenario.equals("found");
        when(service.buscarPorDocumento("123")).thenReturn(found?client:null);
        when(service.buscarPorNomeOuDocumento("Ana")).thenReturn(found?List.of(client):scenario.equals("null")?null:List.of());
        var request=mvc.perform(get("/clientes/buscar-por-documento").param("documento","123")).andExpect(status().is(found?200:204));
        var search=mvc.perform(get("/clientes/buscar").param("termo","Ana")).andExpect(status().is(found?200:204));
        if(found) { request.andExpect(jsonPath("$.id").value(7)); search.andExpect(jsonPath("$[0].nome").value("Ana")); }
        else { request.andExpect(content().string("")); search.andExpect(content().string("")); }
        verify(service).buscarPorDocumento("123"); verify(service).buscarPorNomeOuDocumento("Ana");
    }
}
