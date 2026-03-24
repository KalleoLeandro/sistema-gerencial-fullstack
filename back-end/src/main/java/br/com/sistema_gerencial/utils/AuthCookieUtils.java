package br.com.sistema_gerencial.utils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletResponse;

@Component
public class AuthCookieUtils {

	@Value("${jwt.token.validity}")
	private long accessTokenValidity;

	@Value("${jwt.refresh-token.validity}")
	private long refreshTokenValidity;

	@Value("${jwt.cookie.secure:false}")
	private boolean secureCookie;

	@Value("${jwt.cookie.same-site:Lax}")
	private String sameSite;

	/**
	 * Executa o metodo writeAuthCookies.
	 * @param response valor do parametro response.
	 * @param accessToken valor do parametro accessToken.
	 * @param refreshToken valor do parametro refreshToken.
	 */
	public void writeAuthCookies(HttpServletResponse response, String accessToken, String refreshToken) {
		response.addHeader(HttpHeaders.SET_COOKIE, buildCookie(JwtUtils.ACCESS_COOKIE_NAME, accessToken, accessTokenValidity).toString());
		response.addHeader(HttpHeaders.SET_COOKIE, buildCookie(JwtUtils.REFRESH_COOKIE_NAME, refreshToken, refreshTokenValidity).toString());
	}

	/**
	 * Executa o metodo clearAuthCookies.
	 * @param response valor do parametro response.
	 */
	public void clearAuthCookies(HttpServletResponse response) {
		response.addHeader(HttpHeaders.SET_COOKIE, clearCookie(JwtUtils.ACCESS_COOKIE_NAME).toString());
		response.addHeader(HttpHeaders.SET_COOKIE, clearCookie(JwtUtils.REFRESH_COOKIE_NAME).toString());
	}

	/**
	 * Executa o metodo buildCookie.
	 * @param name valor do parametro name.
	 * @param value valor do parametro value.
	 * @param validityMillis valor do parametro validityMillis.
	 * @return resultado da operacao.
	 */
	private ResponseCookie buildCookie(String name, String value, long validityMillis) {
		return ResponseCookie.from(name, value)
				.httpOnly(true)
				.secure(secureCookie)
				.sameSite(sameSite)
				.path("/")
				.maxAge(validityMillis / 1000)
				.build();
	}

	/**
	 * Executa o metodo clearCookie.
	 * @param name valor do parametro name.
	 * @return resultado da operacao.
	 */
	private ResponseCookie clearCookie(String name) {
		return ResponseCookie.from(name, "")
				.httpOnly(true)
				.secure(secureCookie)
				.sameSite(sameSite)
				.path("/")
				.maxAge(0)
				.build();
	}
}

