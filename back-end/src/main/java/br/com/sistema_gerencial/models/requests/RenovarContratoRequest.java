package br.com.sistema_gerencial.models.requests;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Transporta os dados de entrada para renovar contrato na API.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class RenovarContratoRequest {

	@JsonFormat(pattern = "dd/MM/yyyy HH:mm")
	private LocalDateTime data_inicio;

	@JsonFormat(pattern = "dd/MM/yyyy HH:mm")
	private LocalDateTime data_fim;

	private String observacoes;
}
