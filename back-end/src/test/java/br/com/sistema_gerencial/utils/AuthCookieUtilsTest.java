package br.com.sistema_gerencial.utils;

import static org.assertj.core.api.Assertions.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.util.ReflectionTestUtils;

class AuthCookieUtilsTest {
    @ParameterizedTest @ValueSource(booleans={true,false})
    void escreveELimpaCookiesComMesmosAtributos(boolean secure) {
        var cookies=new AuthCookieUtils();
        ReflectionTestUtils.setField(cookies,"accessTokenValidity",60_000L);
        ReflectionTestUtils.setField(cookies,"refreshTokenValidity",120_000L);
        ReflectionTestUtils.setField(cookies,"secureCookie",secure);
        ReflectionTestUtils.setField(cookies,"sameSite","Lax");
        var response=new MockHttpServletResponse(); cookies.writeAuthCookies(response,"access","refresh");
        assertThat(response.getHeaders("Set-Cookie")).hasSize(2);
        assertThat(response.getHeaders("Set-Cookie").getFirst()).contains("access_token=access","Max-Age=60","Path=/","HttpOnly","SameSite=Lax");
        assertThat(response.getHeaders("Set-Cookie").get(1)).contains("refresh_token=refresh","Max-Age=120");
        assertThat(response.getHeaders("Set-Cookie").getFirst().contains("Secure")).isEqualTo(secure);
        response=new MockHttpServletResponse(); cookies.clearAuthCookies(response);
        assertThat(response.getHeaders("Set-Cookie")).allSatisfy(value->assertThat(value).contains("Max-Age=0","HttpOnly","Path=/"));
    }
}
