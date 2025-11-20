package br.com.sistema_gerencial.configs;

import java.io.IOException;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import br.com.sistema_gerencial.exceptions.DefaultErrorException;
import br.com.sistema_gerencial.utils.JwtUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
	
	private final JwtUtils jwtUtils;
	

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		try {
			String token = jwtUtils.resolveToken(request);			

			if (token != null && jwtUtils.validateToken(token)) {
				Authentication auth = jwtUtils.getAuthentication(token);
				SecurityContextHolder.getContext().setAuthentication(auth);
			}

			filterChain.doFilter(request, response);

		} catch (Exception e) {
			e.printStackTrace();
			throw new DefaultErrorException("Erro interno do servidor", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

}
