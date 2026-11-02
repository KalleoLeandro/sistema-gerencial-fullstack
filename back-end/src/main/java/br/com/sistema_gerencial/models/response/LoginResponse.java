package br.com.sistema_gerencial.models.response;

import org.springframework.http.HttpStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Transporta os dados de login retornados pela API.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class LoginResponse {
	
	private HttpStatus status;
	private String token;
	private String perfil;
	private String expiration;
	private String userName;
}

