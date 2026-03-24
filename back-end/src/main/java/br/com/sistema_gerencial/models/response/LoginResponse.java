package br.com.sistema_gerencial.models.response;

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
public class LoginResponse {
	
	private HttpStatus status;
	private String token;
	private String perfil;
	private String expiration;
	private String userName;
}

