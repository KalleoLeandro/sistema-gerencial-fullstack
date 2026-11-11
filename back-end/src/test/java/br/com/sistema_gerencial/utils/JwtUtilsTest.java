package br.com.sistema_gerencial.utils;

import static org.assertj.core.api.Assertions.*;
import java.util.Date;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.*;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.util.ReflectionTestUtils;
import jakarta.servlet.http.Cookie;

class JwtUtilsTest {
    JwtUtils jwt;
    @BeforeEach void setup() {
        jwt=new JwtUtils(); ReflectionTestUtils.setField(jwt,"secret","test-secret-".repeat(8));
        jwt.JWT_TOKEN_VALIDITY=60_000; jwt.JWT_REFRESH_TOKEN_VALIDITY=120_000;
    }
    @Test void geraClaimsEAutenticacaoComAssinaturaReal() throws Exception {
        String token=jwt.generateAccessToken("Ana","ana","ADMIN");
        assertThat(jwt.validateAccessToken(token)).isTrue(); assertThat(jwt.validateRefreshToken(token)).isFalse();
        assertThat(jwt.getUsernameFromToken("Bearer "+token)).isEqualTo("Ana");
        assertThat(jwt.getLoginFromToken(token)).isEqualTo("ana");
        assertThat(jwt.getRolesFromToken(token)).isEqualTo("ADMIN");
        assertThat(jwt.getTokenType(token)).isEqualTo("access");
        assertThat(jwt.getExpirationDateFromToken(token)).isAfter(new Date());
        assertThat(jwt.isTokenExpired(token)).isFalse();
        var auth=jwt.getAuthentication(token); assertThat(auth.getPrincipal()).isEqualTo("ana");
        assertThat(auth.getAuthorities()).extracting("authority").containsExactly("ROLE_ADMIN");
        String refresh=jwt.generateRefreshToken("Ana","ana","ADMIN");
        assertThat(jwt.validateRefreshToken(refresh)).isTrue(); assertThat(jwt.validateAccessToken(refresh)).isFalse();
    }
    @ParameterizedTest @NullAndEmptySource @ValueSource(strings={" ","invalid","Bearer invalid","a.b.c"})
    void rejeitaTokenMalformado(String token) {
        assertThat(jwt.validateToken(token)).isFalse();
        assertThat(jwt.validateAccessToken(token)).isFalse(); assertThat(jwt.validateRefreshToken(token)).isFalse();
        assertThatThrownBy(()->jwt.getLoginFromToken(token)).hasMessageContaining("extrair claims");
    }
    @Test void rejeitaTokenExpiradoEAssinaturaDeOutraChave() {
        jwt.JWT_TOKEN_VALIDITY=-60_000;
        assertThat(jwt.validateToken(jwt.generateAccessToken("Ana","ana","ADMIN"))).isFalse();
        jwt.JWT_TOKEN_VALIDITY=60_000; String token=jwt.generateAccessToken("Ana","ana","ADMIN");
        ReflectionTestUtils.setField(jwt,"secret","different-secret-".repeat(8));
        assertThat(jwt.validateToken(token)).isFalse();
    }
    @Test void resolveCookiesAntesDoHeaderESomenteCookieParaRefresh() {
        var request=new MockHttpServletRequest(); request.addHeader("Authorization","Bearer header");
        assertThat(jwt.resolveToken(request)).isEqualTo("header"); assertThat(jwt.resolveRefreshToken(request)).isNull();
        request.setCookies(new Cookie("other","x"),new Cookie("access_token","cookie"),new Cookie("refresh_token","refresh"));
        assertThat(jwt.resolveToken(request)).isEqualTo("cookie"); assertThat(jwt.resolveRefreshToken(request)).isEqualTo("refresh");
        request.setCookies(new Cookie("access_token"," "),new Cookie("refresh_token",""));
        assertThat(jwt.resolveToken(request)).isEqualTo("header"); assertThat(jwt.resolveRefreshToken(request)).isNull();
        request.setCookies(new Cookie("other","x")); assertThat(jwt.resolveToken(request)).isEqualTo("header");
    }
    @Test void chaveCurtaEPreenchidaParaHs512() {
        ReflectionTestUtils.setField(jwt,"secret","test");
        assertThat(jwt.getSecretKey().getEncoded()).hasSize(64);
        assertThat(jwt.validateToken(jwt.generateAccessToken("Ana","ana","USER"))).isTrue();
    }
}
