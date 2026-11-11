package br.com.sistema_gerencial.controllers;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.junit.jupiter.api.*;
import org.springframework.http.*;
import org.springframework.test.web.servlet.*;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.test.util.ReflectionTestUtils;
import br.com.sistema_gerencial.services.LoginService;
import br.com.sistema_gerencial.models.response.*;
import br.com.sistema_gerencial.utils.*;
import br.com.sistema_gerencial.exceptions.*;
import jakarta.servlet.http.Cookie;
import java.util.*;

class LoginControllerHttpTest {
    LoginService service; JwtUtils jwt; MockMvc mvc;
    @BeforeEach void setup() {
        service=mock(LoginService.class); jwt=new JwtUtils();
        ReflectionTestUtils.setField(jwt,"secret","test-secret".repeat(8)); jwt.JWT_TOKEN_VALIDITY=60_000; jwt.JWT_REFRESH_TOKEN_VALIDITY=120_000;
        var cookies=new AuthCookieUtils(); ReflectionTestUtils.setField(cookies,"sameSite","Lax");
        ReflectionTestUtils.setField(cookies,"accessTokenValidity",60_000L); ReflectionTestUtils.setField(cookies,"refreshTokenValidity",120_000L);
        mvc=MockMvcBuilders.standaloneSetup(new LoginController(service,jwt,cookies)).setControllerAdvice(new GlobalExceptionHandler()).build();
    }
    LoginResponse session() { var response=new LoginResponse(); response.setStatus(HttpStatus.OK); response.setUserName("Ana"); response.setPerfil("ADMIN"); response.setToken(jwt.generateAccessToken("Ana","ana","ADMIN")); return response; }
    @Test void loginUsaCookiesHttpOnlyEOmiteTokenDoJson() throws Exception {
        when(service.validarLogin(any())).thenReturn(session());
        mvc.perform(post("/login/validar-login").contentType(MediaType.APPLICATION_JSON).content("{\"login\":\"ana\",\"senha\":\"senha\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.userName").value("Ana")).andExpect(jsonPath("$.token").doesNotExist())
                .andExpect(header().stringValues("Set-Cookie",org.hamcrest.Matchers.hasItems(org.hamcrest.Matchers.containsString("access_token="),org.hamcrest.Matchers.containsString("refresh_token="))));
        verify(service).validarLogin(argThat(req->"ana".equals(req.getLogin())&&"senha".equals(req.getSenha())));
    }
    @Test void refreshRenovaCookiesELogoutExpiraAmbos() throws Exception {
        String refresh=jwt.generateRefreshToken("Ana","ana","ADMIN"); when(service.atualizarToken(refresh)).thenReturn(session());
        mvc.perform(post("/login/refresh").cookie(new Cookie("refresh_token",refresh))).andExpect(status().isOk())
                .andExpect(jsonPath("$.token").doesNotExist()).andExpect(header().exists("Set-Cookie")); verify(service).atualizarToken(refresh);
        mvc.perform(post("/login/logout")).andExpect(status().isNoContent())
                .andExpect(header().stringValues("Set-Cookie",org.hamcrest.Matchers.everyItem(org.hamcrest.Matchers.containsString("Max-Age=0"))));
    }
    @Test void loginInvalidoNaoEmiteCookies() throws Exception {
        when(service.validarLogin(any())).thenThrow(new DefaultErrorException("Credenciais invalidas",HttpStatus.UNAUTHORIZED));
        mvc.perform(post("/login/validar-login").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized()).andExpect(header().doesNotExist("Set-Cookie")).andExpect(jsonPath("$.message").value("Credenciais invalidas"));
    }
    @Test void validacaoResolveBearerEUsuarioLogado() throws Exception {
        when(service.validarToken("token")).thenReturn(true); when(service.buscarPorToken()).thenReturn(ExecutorResponse.builder().id(1).nome("Ana").build());
        mvc.perform(post("/login/validar-token").header("Authorization","Bearer token")).andExpect(status().isOk()).andExpect(content().string("true"));
        mvc.perform(get("/login/buscar-por-token")).andExpect(status().isOk()).andExpect(jsonPath("$.nome").value("Ana"));
        verify(service).validarToken("token");
    }
    @Test void administracaoUsuariosERespostas() throws Exception {
        when(service.listarPorPagina(10,1)).thenReturn(Map.of("total",1,"lista",List.of()));
        when(service.listarTodos()).thenReturn(List.of(ExecutorResponse.builder().id(1).build()));
        when(service.buscarPorId(1)).thenReturn(LoginAtualizacaoResponse.builder().id(1).build());
        when(service.buscarPorNome("Ana")).thenReturn(List.of(ExecutorResponse.builder().nome("Ana").build()));
        when(service.retornarPerfil()).thenReturn(Map.of("role","ADMIN"));
        mvc.perform(post("/login/cadastrar").contentType(MediaType.APPLICATION_JSON).content("{\"login\":\"ana\"}")).andExpect(status().isCreated());
        mvc.perform(get("/login/listar").param("limit","10").param("page","1")).andExpect(status().isOk()).andExpect(jsonPath("$.total").value(1));
        mvc.perform(get("/login/listar-todos")).andExpect(status().isOk()).andExpect(jsonPath("$[0].id").value(1));
        mvc.perform(get("/login/buscar-por-id/1")).andExpect(status().isOk()).andExpect(jsonPath("$.id").value(1));
        mvc.perform(get("/login/buscar-por-nome").param("nome","Ana")).andExpect(status().isOk()).andExpect(jsonPath("$[0].nome").value("Ana"));
        mvc.perform(get("/login/retorna-perfil")).andExpect(status().isOk()).andExpect(jsonPath("$.role").value("ADMIN"));
        mvc.perform(put("/login/atualizar").contentType(MediaType.APPLICATION_JSON).content("{\"id\":1}")).andExpect(status().isNoContent());
        mvc.perform(delete("/login/excluir/1")).andExpect(status().isNoContent());
        verify(service).cadastrar(argThat(req->"ana".equals(req.getLogin()))); verify(service).atualizar(argThat(req->req.getId()==1)); verify(service).excluir(1);
    }
}
