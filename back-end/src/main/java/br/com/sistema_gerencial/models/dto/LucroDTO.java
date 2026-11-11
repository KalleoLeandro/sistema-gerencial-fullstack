package br.com.sistema_gerencial.models.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Transporta os valores de lucro utilizados nos indicadores do dashboard.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter 
@Setter
public class LucroDTO {
	private String mes;
	private double valor;
}

