package br.com.sistema_gerencial.utils;

import java.io.Serializable;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

/**
 * Gera e valida tokens JWT e consulta os dados de autenticação contidos nos tokens.
 */
@Component
public class JwtUtils implements Serializable {

	private static final long serialVersionUID = -2550185165626007488L;
	public static final String ACCESS_COOKIE_NAME = "access_token";
	public static final String REFRESH_COOKIE_NAME = "refresh_token";
	private static final String TOKEN_TYPE_CLAIM = "token_type";
	private static final String ACCESS_TOKEN_TYPE = "access";
	private static final String REFRESH_TOKEN_TYPE = "refresh";

	@Value("${jwt.token.validity}")
	public long JWT_TOKEN_VALIDITY;

	@Value("${jwt.refresh-token.validity}")
	public long JWT_REFRESH_TOKEN_VALIDITY;

	@Value("${secret.jwt.secret}")
	private String secret;

	// ===================== GETTERS DE CLAIMS =====================
	/**
	 * Executa o metodo getUsernameFromToken.
	 * @param token valor do parametro token.
	 * @return resultado da operacao.
	 * @throws Exception em caso de falha na execucao.
	 */
	public String getUsernameFromToken(String token) throws Exception {
		return getClaimFromToken(sanitizeToken(token), claims -> claims.get("username", String.class));
	}

	/**
	 * Executa o metodo getLoginFromToken.
	 * @param token valor do parametro token.
	 * @return resultado da operacao.
	 * @throws Exception em caso de falha na execucao.
	 */
	public String getLoginFromToken(String token) throws Exception {
		return getClaimFromToken(sanitizeToken(token), claims -> claims.get("login", String.class));
	}

	/**
	 * Executa o metodo getRolesFromToken.
	 * @param token valor do parametro token.
	 * @return resultado da operacao.
	 * @throws Exception em caso de falha na execucao.
	 */
	public String getRolesFromToken(String token) throws Exception {
		return getClaimFromToken(sanitizeToken(token), claims -> claims.get("role", String.class));
	}

	/**
	 * Executa o metodo getExpirationDateFromToken.
	 * @param token valor do parametro token.
	 * @return resultado da operacao.
	 * @throws Exception em caso de falha na execucao.
	 */
	public Date getExpirationDateFromToken(String token) throws Exception {
		return getClaimFromToken(sanitizeToken(token), Claims::getExpiration);
	}

	/**
	 * Executa o metodo getTokenType.
	 * @param token valor do parametro token.
	 * @return resultado da operacao.
	 * @throws Exception em caso de falha na execucao.
	 */
	public String getTokenType(String token) throws Exception {
		return getClaimFromToken(sanitizeToken(token), claims -> claims.get(TOKEN_TYPE_CLAIM, String.class));
	}

	/**
	 * Executa o metodo getClaimFromToken.
	 * @param token valor do parametro token.
	 * @param claimsResolver valor do parametro claimsResolver.
	 * @return resultado da operacao.
	 * @throws Exception em caso de falha na execucao.
	 */
	public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) throws Exception {
		try {
			final Claims claims = getAllClaimsFromToken(token);
			return claimsResolver.apply(claims);
		} catch (Exception e) {
			throw new Exception("Erro ao extrair claims do token!", e);
		}
	}

	/**
	 * Executa o metodo getAllClaimsFromToken.
	 * @param token valor do parametro token.
	 * @return resultado da operacao.
	 * @throws Exception em caso de falha na execucao.
	 */
	private Claims getAllClaimsFromToken(String token) throws Exception {
		try {
			return Jwts.parserBuilder().setSigningKey(getSecretKey()).build().parseClaimsJws(sanitizeToken(token))
					.getBody();
		} catch (Exception e) {
			throw new Exception("Token invÃ¡lido!", e);
		}
	}

	// ===================== GERADOR E VALIDADOR =====================
	/**
	 * Executa o metodo isTokenExpired.
	 * @param token valor do parametro token.
	 * @return resultado da operacao.
	 * @throws Exception em caso de falha na execucao.
	 */
	public Boolean isTokenExpired(String token) throws Exception {
		final Date expiration = getExpirationDateFromToken(token);
		return expiration.before(new Date());
	}

	/**
	 * Executa o metodo generateAccessToken.
	 * @param userName valor do parametro userName.
	 * @param login valor do parametro login.
	 * @param perfil valor do parametro perfil.
	 * @return resultado da operacao.
	 */
	public String generateAccessToken(String userName, String login, String perfil) {
		Map<String, Object> claims = new HashMap<>();
		claims.put("role", perfil);
		claims.put("username", userName);
		claims.put("login", login);
		claims.put(TOKEN_TYPE_CLAIM, ACCESS_TOKEN_TYPE);
		return doGenerateToken(claims, login, JWT_TOKEN_VALIDITY);
	}

	/**
	 * Executa o metodo generateRefreshToken.
	 * @param userName valor do parametro userName.
	 * @param login valor do parametro login.
	 * @param perfil valor do parametro perfil.
	 * @return resultado da operacao.
	 */
	public String generateRefreshToken(String userName, String login, String perfil) {
		Map<String, Object> claims = new HashMap<>();
		claims.put("role", perfil);
		claims.put("username", userName);
		claims.put("login", login);
		claims.put(TOKEN_TYPE_CLAIM, REFRESH_TOKEN_TYPE);
		return doGenerateToken(claims, login, JWT_REFRESH_TOKEN_VALIDITY);
	}

	/**
	 * Executa o metodo doGenerateToken.
	 * @param claims valor do parametro claims.
	 * @param subject valor do parametro subject.
	 * @param validity valor do parametro validity.
	 * @return resultado da operacao.
	 */
	private String doGenerateToken(Map<String, Object> claims, String subject, long validity) {
		return Jwts.builder().setClaims(claims).setSubject(subject).setIssuedAt(new Date(System.currentTimeMillis()))
				.setExpiration(new Date(System.currentTimeMillis() + validity))
				.signWith(getSecretKey(), SignatureAlgorithm.HS512).compact();
	}

	/**
	 * Executa o metodo validateToken.
	 * @param token valor do parametro token.
	 * @return resultado da operacao.
	 */
	public Boolean validateToken(String token) {
		try {
			String tokenSanitizado = sanitizeToken(token);
			JwtParser parser = Jwts.parserBuilder().setSigningKey(getSecretKey()).build();

			parser.parseClaimsJws(sanitizeToken(tokenSanitizado));
			return true;
		} catch (JwtException | IllegalArgumentException e) {
			return false;
		}
	}

	/**
	 * Executa o metodo validateAccessToken.
	 * @param token valor do parametro token.
	 * @return resultado da operacao.
	 */
	public Boolean validateAccessToken(String token) {
		return validateTokenByType(token, ACCESS_TOKEN_TYPE);
	}

	/**
	 * Executa o metodo validateRefreshToken.
	 * @param token valor do parametro token.
	 * @return resultado da operacao.
	 */
	public Boolean validateRefreshToken(String token) {
		return validateTokenByType(token, REFRESH_TOKEN_TYPE);
	}

	/**
	 * Executa o metodo validateTokenByType.
	 * @param token valor do parametro token.
	 * @param expectedType valor do parametro expectedType.
	 * @return resultado da operacao.
	 */
	private Boolean validateTokenByType(String token, String expectedType) {
		try {
			if (!validateToken(token)) {
				return false;
			}
			return Objects.equals(expectedType, getTokenType(token));
		} catch (Exception e) {
			return false;
		}
	}

	/**
	 * Executa o metodo getAuthentication.
	 * @param token valor do parametro token.
	 * @return resultado da operacao.
	 * @throws Exception em caso de falha na execucao.
	 */
	public Authentication getAuthentication(String token) throws Exception {
	    String login = getLoginFromToken(token);
	    String role = getRolesFromToken(token);
	    SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);
	    return new UsernamePasswordAuthenticationToken(login, null, List.of(authority));
	}

	/**
	 * Executa o metodo getSecretKey.
	 * @return resultado da operacao.
	 */
	public Key getSecretKey() {
		byte[] keyBytes = secret.getBytes();
		byte[] truncatedKeyBytes = new byte[64]; // 512 bits
		System.arraycopy(keyBytes, 0, truncatedKeyBytes, 0, Math.min(keyBytes.length, truncatedKeyBytes.length));
		return Keys.hmacShaKeyFor(truncatedKeyBytes);
	}

	/**
	 * Executa o metodo sanitizeToken.
	 * @param token valor do parametro token.
	 * @return resultado da operacao.
	 */
	public String sanitizeToken(String token) {
		if (token != null && token.startsWith("Bearer ")) {
			return token.substring(7);
		}
		return token;
	}

	/**
	 * Executa o metodo resolveToken.
	 * @param request valor do parametro request.
	 * @return resultado da operacao.
	 */
	public String resolveToken(HttpServletRequest request) {
		String cookieToken = getCookieValue(request, ACCESS_COOKIE_NAME);
		if (cookieToken != null && !cookieToken.isBlank()) {
			return sanitizeToken(cookieToken);
		}
		return sanitizeToken(request.getHeader("Authorization"));
	}

	/**
	 * Executa o metodo resolveRefreshToken.
	 * @param request valor do parametro request.
	 * @return resultado da operacao.
	 */
	public String resolveRefreshToken(HttpServletRequest request) {
		String cookieToken = getCookieValue(request, REFRESH_COOKIE_NAME);
		if (cookieToken != null && !cookieToken.isBlank()) {
			return sanitizeToken(cookieToken);
		}
		return null;
	}

	/**
	 * Executa o metodo getCookieValue.
	 * @param request valor do parametro request.
	 * @param cookieName valor do parametro cookieName.
	 * @return resultado da operacao.
	 */
	private String getCookieValue(HttpServletRequest request, String cookieName) {
		if (request.getCookies() == null) {
			return null;
		}

		for (Cookie cookie : request.getCookies()) {
			if (cookieName.equals(cookie.getName())) {
				return cookie.getValue();
			}
		}

		return null;
	}
}

