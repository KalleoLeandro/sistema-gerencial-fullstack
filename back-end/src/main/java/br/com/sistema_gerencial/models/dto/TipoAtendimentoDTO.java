package br.com.sistema_gerencial.models.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Transporta a classificação e a quantidade de atendimentos para o dashboard.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter 
@Setter
public class TipoAtendimentoDTO {

	private String tipo;
	private int quantidade;
}

