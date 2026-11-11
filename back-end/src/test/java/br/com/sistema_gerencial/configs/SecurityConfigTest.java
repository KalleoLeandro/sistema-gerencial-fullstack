package br.com.sistema_gerencial.configs;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import br.com.sistema_gerencial.config.CorsConfig;

@org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest(br.com.sistema_gerencial.controllers.LoginController.class)
@org.springframework.context.annotation.Import({CorsConfig.class,
    br.com.sistema_gerencial.config.JwtAuthenticationFilter.class,
    br.com.sistema_gerencial.exceptions.CustomAccessDeniedHandler.class,
    br.com.sistema_gerencial.exceptions.CustomAuthenticationEntryPoint.class})
@ActiveProfiles("test")
@AutoConfigureMockMvc
class SecurityConfigTest {

    @Autowired private org.springframework.test.web.servlet.MockMvc mvc;

    @Test void rotaProtegidaSemSessaoRetorna401() throws Exception {
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/login/listar").param("limit","10").param("page","1"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isUnauthorized())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.status").value(401));
    }

    @Test @org.springframework.security.test.context.support.WithMockUser(roles="USER")
    void usuarioSemPermissaoAdministrativaRecebe403() throws Exception {
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/login/excluir/2"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isForbidden())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.status").value(403));
        org.mockito.Mockito.verifyNoInteractions(loginService);
    }

    @Test @org.springframework.security.test.context.support.WithMockUser(roles="ADMIN")
    void administradorPodeExcluir() throws Exception {
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/login/excluir/2"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isNoContent());
        org.mockito.Mockito.verify(loginService).excluir(2);
    }

    @Test void logoutPublicoECorsBloqueiaOrigemNaoPermitida() throws Exception {
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/login/logout"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isNoContent());
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options("/login/validar-login")
                .header("Origin","https://untrusted.example").header("Access-Control-Request-Method","POST"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isForbidden());
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options("/login/validar-login")
                .header("Origin","http://localhost:4200").header("Access-Control-Request-Method","POST"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isOk())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().string("Access-Control-Allow-Credentials","true"));
    }

    @org.springframework.test.context.bean.override.mockito.MockitoBean
    br.com.sistema_gerencial.services.LoginService loginService;
    @org.springframework.test.context.bean.override.mockito.MockitoBean
    br.com.sistema_gerencial.utils.JwtUtils jwtUtils;
    @org.springframework.test.context.bean.override.mockito.MockitoBean
    br.com.sistema_gerencial.utils.AuthCookieUtils authCookieUtils;

    @Autowired
    private SecurityFilterChain securityFilterChain;

    @Autowired
    private CorsConfigurationSource corsConfigurationSource;

    @Autowired
    private CorsConfig corsConfig;

    @Test
    void deveCriarBeansDeSeguranca() {
        assertNotNull(securityFilterChain);
        assertNotNull(corsConfigurationSource);
        assertNotNull(corsConfig);
    }

    @Test
    void deveConfigurarCorsComCredenciaisEMetodosPadrao() {
        CorsConfiguration configuration = corsConfig.corsConfigurationSource()
                .getCorsConfiguration(new MockHttpServletRequest("GET", "/login/validar-login"));

        assertNotNull(configuration);
        assertTrue(Boolean.TRUE.equals(configuration.getAllowCredentials()));
        assertTrue(configuration.getAllowedMethods().contains("GET"));
        assertTrue(configuration.getAllowedMethods().contains("POST"));
        assertTrue(configuration.getAllowedOriginPatterns().contains("http://localhost:*"));
    }
}
