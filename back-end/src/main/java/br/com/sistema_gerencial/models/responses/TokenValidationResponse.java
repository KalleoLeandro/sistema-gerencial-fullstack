package br.com.sistema_gerencial.models.responses;

import org.springframework.http.HttpStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class TokenValidationResponse {

	private Boolean valid;
	private HttpStatus status;
	private String userName;
	private String perfil;
	private String login;
	private String expiration;
}
