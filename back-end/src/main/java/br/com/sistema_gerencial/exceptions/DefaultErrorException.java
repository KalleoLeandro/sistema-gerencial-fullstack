package br.com.sistema_gerencial.exceptions;

import org.springframework.http.HttpStatus;

/**
 * Representa uma falha de negócio com mensagem e status HTTP definido pelo serviço.
 */
public class DefaultErrorException extends RuntimeException {
	
	private static final long serialVersionUID = 1L;
	
	private HttpStatus status;

    /**
     * Cria uma nova instancia de DefaultErrorException.
     * @param message valor do parametro message.
     * @param status valor do parametro status.
     */
    public DefaultErrorException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    /**
     * Executa o metodo getStatus.
     * @return resultado da operacao.
     */
    public HttpStatus getStatus() {
        return status;
    }
}

