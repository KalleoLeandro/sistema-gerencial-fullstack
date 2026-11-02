package br.com.sistema_gerencial.models.requests;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Transporta os dados de entrada para rejeição de orçamento na API.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class RejeitarOrcamentoRequest {

	private int id_orcamento;
	private String motivo;
}
