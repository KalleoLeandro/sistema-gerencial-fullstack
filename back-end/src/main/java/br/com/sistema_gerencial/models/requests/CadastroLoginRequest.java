package br.com.sistema_gerencial.models.requests;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Transporta os dados de entrada para cadastro login na API.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class CadastroLoginRequest {
	
	private String nome;
	private String login;
	private String senha;
	private String perfil;

}

