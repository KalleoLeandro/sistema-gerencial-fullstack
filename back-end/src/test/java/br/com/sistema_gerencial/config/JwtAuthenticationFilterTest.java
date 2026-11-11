package br.com.sistema_gerencial.config;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.*;
import org.springframework.mock.web.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import br.com.sistema_gerencial.utils.JwtUtils;
import jakarta.servlet.FilterChain;

class JwtAuthenticationFilterTest {
    @AfterEach void cleanup() { SecurityContextHolder.clearContext(); }
    @ParameterizedTest @ValueSource(strings={"valid","invalid","missing"})
    void somenteTokenDeAcessoValidoAutentica(String mode) throws Exception {
        var jwt=mock(JwtUtils.class); var filter=new JwtAuthenticationFilter(jwt);
        var request=new MockHttpServletRequest(); var response=new MockHttpServletResponse(); var chain=mock(FilterChain.class);
        var auth=new UsernamePasswordAuthenticationToken("ana",null,java.util.List.of());
        when(jwt.resolveToken(request)).thenReturn(mode.equals("missing")?null:"token");
        if(!mode.equals("missing")) when(jwt.validateAccessToken("token")).thenReturn(mode.equals("valid"));
        if(mode.equals("valid")) when(jwt.getAuthentication("token")).thenReturn(auth);
        filter.doFilter(request,response,chain); verify(chain).doFilter(request,response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isEqualTo(mode.equals("valid")?auth:null);
    }
    @Test void erroDaCadeiaRetornaErroDeDominio() throws Exception {
        var chain=mock(FilterChain.class); doThrow(new jakarta.servlet.ServletException("broken")).when(chain).doFilter(any(),any());
        assertThatThrownBy(()->new JwtAuthenticationFilter(mock(JwtUtils.class)).doFilter(new MockHttpServletRequest(),new MockHttpServletResponse(),chain))
                .hasMessage("Erro interno do servidor");
    }
}
