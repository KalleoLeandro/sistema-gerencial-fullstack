package br.com.sistema_gerencial.models.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Transporta os dados de usuários utilizados nas consultas de listagem.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter 
@Setter
public class LoginListaDTO {
	private int id;
	private String nome;
	private String login;	
}


