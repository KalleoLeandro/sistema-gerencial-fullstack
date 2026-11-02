package br.com.sistema_gerencial.models.requests;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Transporta os dados de entrada para reabertura de orçamento na API.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(name = "ReabrirOrcamentoRequest", description = "Payload para reabrir um orcamento rejeitado")
public class ReabrirOrcamentoRequest {

	@NotNull
	private Integer id_orcamento;
}
