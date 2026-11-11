package br.com.sistema_gerencial.models.response;

import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Transporta os dados de caixa resumo dia retornados pela API.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CaixaResumoDiaResponse {

	private LocalDate data_referencia;
	private List<CaixaResumoPagamentoResponse> resumo;
	private List<CaixaFechamentoResponse> fechamentos;
}
