package br.com.sistema_gerencial.models.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter 
@Setter
public class LoginDTO {
	
	private String nome;	
	private String perfil;

}
