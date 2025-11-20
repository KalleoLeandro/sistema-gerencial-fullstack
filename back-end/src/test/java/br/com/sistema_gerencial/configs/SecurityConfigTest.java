package br.com.sistema_gerencial.configs;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class SecurityConfigTest {

    @Autowired
    private SecurityFilterChain securityFilterChain;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void deveCriarBeansDeSeguranca() {
        assertNotNull(securityFilterChain);
        assertNotNull(authenticationManager);
        assertNotNull(passwordEncoder);
        assertTrue(passwordEncoder.matches("senha123", passwordEncoder.encode("senha123")));
    }
}
