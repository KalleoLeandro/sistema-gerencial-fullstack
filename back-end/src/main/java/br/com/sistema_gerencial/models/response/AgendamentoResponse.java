package br.com.sistema_gerencial.models.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Transporta os dados de agendamento retornados pela API.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class AgendamentoResponse {
	private int id;
	private String titulo;
	private String tipo_tarefa;
	private LocalDateTime data_agendamento;
	private String detalhes;
	private boolean concluido;
}
