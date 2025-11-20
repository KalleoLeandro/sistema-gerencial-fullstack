package br.com.sistema_gerencial.models.requests;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter 
@Setter
public class LoginRequest {	
	
	@Schema(description = "Nome de login do usuário", example = "joaosilva", requiredMode = Schema.RequiredMode.REQUIRED)
	@NotEmpty(message = "O login não pode estar vazio")
	@NotBlank(message = "O login não pode estar vazio")
	private String login;
	
	@Schema(description = "Senha do usuário", example = "Senha@123", requiredMode = Schema.RequiredMode.REQUIRED)
	@NotEmpty(message = "A senha não pode estar vazia")
	@NotBlank(message = "A senha não pode estar vazia")
	private String senha;
}