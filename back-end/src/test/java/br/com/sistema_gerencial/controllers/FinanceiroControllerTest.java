package br.com.sistema_gerencial.controllers;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import br.com.sistema_gerencial.config.*;
import br.com.sistema_gerencial.exceptions.*;
import br.com.sistema_gerencial.services.impl.FinanceiroService;
import br.com.sistema_gerencial.utils.JwtUtils;
import static br.com.sistema_gerencial.models.financeiro.FinanceiroModels.*;

@WebMvcTest(FinanceiroController.class)
@Import({CorsConfig.class,JwtAuthenticationFilter.class,CustomAccessDeniedHandler.class,CustomAuthenticationEntryPoint.class})
class FinanceiroControllerTest {
    @Autowired MockMvc mvc;
    @MockitoBean FinanceiroService service;
    @MockitoBean JwtUtils jwt;
    String request="""
        {"tipo":"PAGAR","descricao":"Conta","contraparte":"Parceiro","vencimento":"2026-10-13","valor":100}
        """;
    @Test void semSessaoRecebe401() throws Exception {
        mvc.perform(get("/financeiro/contas")).andExpect(status().isUnauthorized());verifyNoInteractions(service);
    }
    @Test @WithMockUser(roles="USER") void usuarioSemPermissaoRecebe403() throws Exception {
        mvc.perform(get("/financeiro/contas")).andExpect(status().isForbidden());verifyNoInteractions(service);
    }
    @Test @WithMockUser(roles="ADMIN") void administradorLista() throws Exception {
        when(service.listar(any(),eq(1),eq(10))).thenReturn(new Pagina(List.of(),0,1,10));
        mvc.perform(get("/financeiro/contas")).andExpect(status().isOk()).andExpect(jsonPath("$.total").value(0));
    }
    @Test @WithMockUser(roles="DEV") void desenvolvedorPodeCriar() throws Exception {
        mvc.perform(post("/financeiro/contas").contentType("application/json").content(request)).andExpect(status().isCreated());verify(service).criar(any());
    }
    @Test @WithMockUser(roles="ADMIN") void rejeitaValorNegativoDescricaoVaziaETipoInvalido() throws Exception {
        for(String body:List.of(request.replace("100","-1"),request.replace("Conta",""),request.replace("PAGAR","INVALIDO"),request.replace("100","10.123"))) {
            mvc.perform(post("/financeiro/contas").contentType("application/json").content(body)).andExpect(status().isBadRequest());
        }
        verifyNoInteractions(service);
    }
    @Test @WithMockUser(roles="ADMIN") void baixaExigeValorDataEForma() throws Exception {
        mvc.perform(post("/financeiro/contas/MANUAL/1/baixas").contentType("application/json").content("{\"valor\":0}")).andExpect(status().isBadRequest());
        verifyNoInteractions(service);
    }
    @Test @WithMockUser(roles="ADMIN") void rotasDeDetalhesAtualizacaoBaixaCancelamentoERelatorio() throws Exception {
        mvc.perform(get("/financeiro/contas/MANUAL/1")).andExpect(status().isOk());verify(service).detalhes("MANUAL",1);
        mvc.perform(put("/financeiro/contas/1").contentType("application/json").content(request)).andExpect(status().isOk());verify(service).atualizar(eq(1L),any());
        mvc.perform(post("/financeiro/contas/MANUAL/1/baixas").contentType("application/json").content("{\"data\":\"2026-10-13\",\"valor\":10,\"formaPagamento\":\"PIX\"}")).andExpect(status().isOk());verify(service).baixar(eq("MANUAL"),eq(1L),any());
        mvc.perform(post("/financeiro/contas/1/cancelar")).andExpect(status().isNoContent());verify(service).cancelar(1);
        mvc.perform(get("/financeiro/relatorios")).andExpect(status().isOk());verify(service).relatorio(any());
    }
}
