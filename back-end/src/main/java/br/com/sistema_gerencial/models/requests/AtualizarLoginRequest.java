package br.com.sistema_gerencial.models.requests;


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
public class AtualizarLoginRequest {
	
	private int id;
	private String nome;
	private String login;
	private String senha;
	private String perfil;

}

