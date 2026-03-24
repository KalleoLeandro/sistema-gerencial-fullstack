package br.com.sistema_gerencial.exceptions;

import java.io.IOException;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

	/**
	 * Executa o metodo commence.
	 * @param request valor do parametro request.
	 * @param response valor do parametro response.
	 * @param authException valor do parametro authException.
	 * @throws IOException em caso de falha na execucao.
	 */
	@Override
	public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
			throws IOException {
		response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
		response.setContentType("application/json");

		String json = """
		{
		    "status": 401,
		    "message": "SessÃ£o invÃ¡lida ou expirada.",
		    "path": "%s"
		}
		""".formatted(request.getRequestURI());

		response.getWriter().write(json);
	}
}

