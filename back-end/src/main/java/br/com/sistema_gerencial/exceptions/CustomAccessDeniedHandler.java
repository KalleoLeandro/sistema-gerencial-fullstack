package br.com.sistema_gerencial.exceptions;

import java.io.IOException;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    /**
     * Executa o metodo handle.
     * @param request valor do parametro request.
     * @param response valor do parametro response.
     * @param accessDeniedException valor do parametro accessDeniedException.
     * @throws IOException em caso de falha na execucao.
     */
    @Override
    public void handle(HttpServletRequest request,
                       HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {

        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");

        String json = """
        {
            "status": 403,
            "message": "Acesso negado: vocÃª nÃ£o tem permissÃ£o para acessar este recurso.",
            "path": "%s"
        }
        """.formatted(request.getRequestURI());

        response.getWriter().write(json);
    }
}

