package br.com.sistema_gerencial.services.impl;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.util.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.*;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;
import br.com.sistema_gerencial.repositories.LoginRepository;
import br.com.sistema_gerencial.models.dto.LoginDTO;
import br.com.sistema_gerencial.models.requests.LoginRequest;
import br.com.sistema_gerencial.models.response.ExecutorResponse;
import br.com.sistema_gerencial.utils.*;
import br.com.sistema_gerencial.exceptions.DefaultErrorException;

class LoginServiceImplTest {
    LoginRepository repository; JwtUtils jwt; LoginServiceImpl service;
    @BeforeEach void setup() {
        repository=mock(LoginRepository.class); jwt=spy(new JwtUtils());
        ReflectionTestUtils.setField(jwt,"secret","unit-test-secret".repeat(5));
        jwt.JWT_TOKEN_VALIDITY=60_000; jwt.JWT_REFRESH_TOKEN_VALIDITY=120_000;
        service=new LoginServiceImpl(repository,new GeralUtils(),jwt);
    }
    @AfterEach void clear() { SecurityContextHolder.clearContext(); }
    @Test void loginERenovacaoUsamTokensReais() {
        when(repository.buscarPorLoginESenha("ana","senha")).thenReturn(LoginDTO.builder().nome("Ana").perfil("ADMIN").build());
        var request=new LoginRequest(); request.setLogin("ana"); request.setSenha("senha");
        var result=service.validarLogin(request);
        assertThat(result.getStatus()).isEqualTo(HttpStatus.OK); assertThat(result.getUserName()).isEqualTo("Ana");
        assertThat(result.getExpiration()).matches("\\d{2}/\\d{2}/\\d{4}");
        assertThat(jwt.validateAccessToken(result.getToken())).isTrue();
        var refreshed=service.atualizarToken(jwt.generateRefreshToken("Ana","ana","ADMIN"));
        assertThat(refreshed.getPerfil()).isEqualTo("ADMIN"); assertThat(service.validarToken(refreshed.getToken())).isTrue();
    }
    @Test void credenciaisInvalidasRetornam401() {
        assertThatThrownBy(()->service.validarLogin(new LoginRequest())).isInstanceOfSatisfying(DefaultErrorException.class,
                e->assertThat(e.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED));
    }
    @ParameterizedTest @NullAndEmptySource @ValueSource(strings={" ","invalid"})
    void refreshInvalidoRetorna401(String token) {
        assertThatThrownBy(()->service.atualizarToken(token)).isInstanceOfSatisfying(DefaultErrorException.class,
                e->assertThat(e.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED));
    }
    @Test void erroAoExtrairTokenRetorna500() throws Exception {
        String refresh=jwt.generateRefreshToken("Ana","ana","ADMIN");
        doThrow(new Exception("broken")).when(jwt).getLoginFromToken(refresh);
        assertThatThrownBy(()->service.atualizarToken(refresh)).hasMessageContaining("Erro ao atualizar");
        when(repository.buscarPorLoginESenha("ana","senha")).thenReturn(LoginDTO.builder().nome("Ana").perfil("ADMIN").build());
        doThrow(new Exception("broken")).when(jwt).getExpirationDateFromToken(anyString());
        var request=new LoginRequest(); request.setLogin("ana"); request.setSenha("senha");
        assertThatThrownBy(()->service.validarLogin(request)).hasMessageContaining("Erro ao gerar");
    }
    @Test void validaContextoAutenticadoEBuscaPerfilEExecutor() {
        assertThat(service.validarToken(null)).isFalse();
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("ana",null,List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))));
        assertThat(service.validarToken(" ")).isTrue(); assertThat(service.retornarPerfil()).containsEntry("role","ADMIN");
        var executor=ExecutorResponse.builder().id(1).nome("Ana").build(); when(repository.buscarPorLogin("ana")).thenReturn(executor);
        assertThat(service.buscarPorToken()).isSameAs(executor);
        SecurityContextHolder.getContext().setAuthentication(new AnonymousAuthenticationToken("key","anonymousUser",List.of(new SimpleGrantedAuthority("ROLE_ANONYMOUS"))));
        assertThat(service.validarToken(null)).isFalse();
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("ana",null));
        assertThat(service.validarToken(null)).isFalse();
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("anonymousUser",null,List.of()));
        assertThat(service.validarToken(null)).isFalse();
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(" ",null,List.of()));
        assertThat(service.validarToken(null)).isFalse();
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(123,null,List.of()));
        assertThat(service.validarToken(null)).isFalse();
        assertThat(service.retornarPerfil()).containsEntry("role","");
    }
    @Test void errosDeContextoEValidacaoSaoTraduzidos() {
        assertThatThrownBy(service::retornarPerfil).hasMessageContaining("papeis");
        assertThatThrownBy(service::buscarPorToken).hasMessageContaining("executor");
        doThrow(new IllegalStateException("broken")).when(jwt).validateAccessToken("token");
        assertThatThrownBy(()->service.validarToken("token")).hasMessageContaining("validacao");
    }
}
