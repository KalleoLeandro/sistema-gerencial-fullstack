package br.com.sistema_gerencial.models.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Transporta os dados de login atualização retornados pela API.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter 
@Setter
@Builder
public class LoginAtualizacaoResponse {	
	private int id;
	private String nome;
	private String login;	
	private String perfil;
}

