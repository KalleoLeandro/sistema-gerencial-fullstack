package br.com.sistema_gerencial.utils;


import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Date;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import jakarta.servlet.http.HttpServletRequest;

@SpringBootTest
@TestPropertySource(properties = { "jwt.token.validity=1000", "secret.jwt.secret=myTestSecretKey" })
@ActiveProfiles("test")
public class JwtUtilsTest {

	@Autowired
	private JwtUtils jwtUtils;

	@TestConfiguration
	static class SpyJwtUtilsConfig {
		@Bean
		@Primary
		public JwtUtils jwtUtils() {
			return Mockito.spy(new JwtUtils());
		}
	}

	@Test
	public void testGenerateToken() {
		String username = "testUser";
		String login = "testLogin";
		String perfil = "admin";
		String token = jwtUtils.generateToken(username, login, perfil);

		Assertions.assertNotNull(token);
		Assertions.assertFalse(token.isEmpty());
	}

	@Test
	public void testGetUsernameFromToken() throws Exception {
		String username = "testUser";
		String login = "testLogin";
		String perfil = "admin";
		String token = jwtUtils.generateToken(username, login, perfil);

		String extractedUsername = jwtUtils.getUsernameFromToken(token);

		Assertions.assertEquals(username, extractedUsername);
	}

	@Test
	public void testGetPerfilFromToken() throws Exception {
		String username = "testUser";
		String login = "testLogin";
		String perfil = "admin";
		String token = jwtUtils.generateToken(username, login, perfil);

		String extractedPerfil = jwtUtils.getRolesFromToken(token);

		Assertions.assertEquals(perfil, extractedPerfil);
	}

	@Test
	public void testGetLoginFromToken() throws Exception {
		String username = "testUser";
		String login = "testLogin";
		String perfil = "admin";
		String token = jwtUtils.generateToken(username, login, perfil);

		String extractedLogin = jwtUtils.getLoginFromToken(token);

		Assertions.assertEquals(login, extractedLogin);
	}

	@Test
	public void testGetExpirationDateFromToken() throws Exception {
		String username = "testUser";
		String login = "testLogin";
		String perfil = "admin";
		String token = jwtUtils.generateToken(username, login, perfil);

		Date expirationDate = jwtUtils.getExpirationDateFromToken(token);

		Assertions.assertNotNull(expirationDate);
		Assertions.assertTrue(expirationDate.after(new Date()));
	}

	@Test
	public void testIsTokenExpired() throws Exception {
		String username = "testUser";
		String login = "testLogin";
		String perfil = "admin";
		String token = jwtUtils.generateToken(username, login, perfil);

		Boolean isExpired = jwtUtils.isTokenExpired(token);

		Assertions.assertTrue(!isExpired);
	}

	@Test
	public void testIsTokenExpiredErro() throws Exception {
		String username = "testUser";
		String login = "testLogin";
		String perfil = "admin";
		String token = jwtUtils.generateToken(username, login, perfil);
		
		Thread.sleep(2000); // Aguardar a expiração do token

		Exception exception = Assertions.assertThrows(Exception.class, () -> {
			jwtUtils.isTokenExpired(token);
		});

		Assertions.assertTrue(exception.getMessage().contains("Erro"));
	}

	@Test
	public void testValidateToken() {
		String username = "testUser";
		String login = "testLogin";
		String perfil = "admin";
		String token = jwtUtils.generateToken(username, login, perfil);

		Boolean isValid = jwtUtils.validateToken(token);
		Assertions.assertTrue(isValid);

		// Testando um token inválido
		String invalidToken = "invalidToken";
		Boolean isInvalid = jwtUtils.validateToken(invalidToken);
		Assertions.assertFalse(isInvalid);
	}

	@Test
	void deveRemoverPrefixoBearerDoToken() {
		String tokenComPrefixo = "Bearer my-token-value";
		String tokenEsperado = "my-token-value";

		String tokenSanitizado = jwtUtils.sanitizeToken(tokenComPrefixo);

		Assertions.assertEquals(tokenEsperado, tokenSanitizado);
	}

	@Test
	void naoDeveAlterarTokenSeNaoTiverPrefixo() {
		String tokenSemPrefixo = "my-token-value";

		String tokenSanitizado = jwtUtils.sanitizeToken(tokenSemPrefixo);

		Assertions.assertEquals(tokenSemPrefixo, tokenSanitizado);
	}

	@Test
	void deveRetornarNullSeTokenForNull() {
		String token = null;

		String tokenSanitizado = jwtUtils.sanitizeToken(token);

		Assertions.assertNull(tokenSanitizado);
	}

	@Test
	void deveResolverTokenDoHeaderAuthorization() {

		HttpServletRequest request = mock(HttpServletRequest.class);
		String headerValue = "Bearer my-token-value";

		when(request.getHeader("Authorization")).thenReturn(headerValue);

		String tokenResolvido = jwtUtils.resolveToken(request);

		Assertions.assertEquals("my-token-value", tokenResolvido);
	}

	@Test
	void deveRetornarNullSeHeaderNaoContiverAuthorization() {

		HttpServletRequest request = mock(HttpServletRequest.class);

		when(request.getHeader("Authorization")).thenReturn(null);

		String tokenResolvido = jwtUtils.resolveToken(request);

		Assertions.assertNull(tokenResolvido);
	}

	@Test
	void deveRetornarAuthenticationComUsernameERole() throws Exception {
		String token = "qualquer-coisa-aqui";
		String username = "kalleo";
		String role = "ROLE_USER";

		Mockito.doReturn(username).when(jwtUtils).getUsernameFromToken(token);
		Mockito.doReturn(role).when(jwtUtils).getRolesFromToken(token);

		Authentication auth = jwtUtils.getAuthentication(token);

		Assertions.assertNotNull(auth);
		Assertions.assertEquals(username, auth.getPrincipal());
		Assertions.assertTrue(auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals(role)));
	}
}