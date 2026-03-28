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

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class SecurityConfigTest {

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
