package br.com.sistema_gerencial.exceptions;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Transporta timestamp, status, classificação e mensagem de um erro da API.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class ApiError {
	private String timestamp;
    private int status;
    private String error;
    private String message;    
}

