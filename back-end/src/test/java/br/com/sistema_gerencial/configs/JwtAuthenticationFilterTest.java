package br.com.sistema_gerencial.configs;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;

import br.com.sistema_gerencial.exceptions.DefaultErrorException;
import br.com.sistema_gerencial.utils.JwtUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class JwtAuthenticationFilterTest {

    @InjectMocks
    private JwtAuthenticationFilter filter;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private FilterChain filterChain;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @BeforeEach
    void setup() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void deveAutenticarComTokenValido() throws Exception {
        // Limpa o SecurityContextHolder antes de cada execução do teste
        SecurityContextHolder.clearContext();

        String token = "valid-token";

        // Mockando comportamentos
        Mockito.when(request.getRequestURI()).thenReturn("/api/usuarios");
        Mockito.when(jwtUtils.resolveToken(request)).thenReturn(token);
        Mockito.when(jwtUtils.validateToken(token)).thenReturn(true);
        Mockito.when(jwtUtils.isTokenExpired(token)).thenReturn(false);
        Mockito.when(jwtUtils.getUsernameFromToken(token)).thenReturn("kalleo");
        Mockito.when(jwtUtils.getRolesFromToken(token)).thenReturn("ROLE_USER");

        // Mockando o Authentication
        Authentication mockAuth = Mockito.mock(Authentication.class);
        Mockito.when(jwtUtils.getAuthentication(token)).thenReturn(mockAuth);

        // Executando o filtro
        filter.doFilterInternal(request, response, filterChain);

        // Verificando se o contexto de segurança foi preenchido corretamente
        Assertions.assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        Assertions.assertEquals(mockAuth, SecurityContextHolder.getContext().getAuthentication());

        // Verificando se o doFilter foi chamado no filterChain
        Mockito.verify(filterChain, Mockito.times(1)).doFilter(request, response);
    }



    @Test
    void naoDeveAutenticarQuandoTokenInvalido() throws Exception {
        Mockito.when(request.getRequestURI()).thenReturn("/api/usuarios");
        Mockito.when(jwtUtils.resolveToken(request)).thenReturn(null); // nenhum token

        filter.doFilterInternal(request, response, filterChain);

        Assertions.assertNull(SecurityContextHolder.getContext().getAuthentication());
        Mockito.verify(filterChain).doFilter(request, response);
    }

    @Test
    void deveLancarExcecaoQuandoJwtFalhar() throws Exception {
        Mockito.when(request.getRequestURI()).thenReturn("/api/usuarios");
        Mockito.when(jwtUtils.resolveToken(request)).thenReturn("token");
        Mockito.when(jwtUtils.validateToken("token")).thenThrow(new RuntimeException("falha"));

        DefaultErrorException ex = Assertions.assertThrows(DefaultErrorException.class, () -> {
            filter.doFilterInternal(request, response, filterChain);
        });

        Assertions.assertEquals("Erro interno do servidor", ex.getMessage());
        Assertions.assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, ex.getStatus());
    }
}
