package br.com.sistema_gerencial.exceptions;

import org.springframework.http.HttpStatus;

public class DefaultErrorException extends RuntimeException {
	
	private static final long serialVersionUID = 1L;
	
	private HttpStatus status;

    public DefaultErrorException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
