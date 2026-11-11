package br.com.sistema_gerencial.models.requests;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Transporta os dados de entrada para cadastrar agendamento na API.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class CadastrarAgendamentoRequest {

	private String titulo;
	private String tipo_tarefa;
	private LocalDateTime data_agendamento;
	private String detalhes;
	private boolean concluido;
}
