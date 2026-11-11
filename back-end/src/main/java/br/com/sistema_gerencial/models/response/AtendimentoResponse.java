package br.com.sistema_gerencial.models.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Transporta os dados de atendimento retornados pela API.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class AtendimentoResponse {
	
	private int id;
	private int id_empresa;
	private LocalDateTime data_inicio;
	private LocalDateTime data_fim;
	private String solicitante;
	private String tipo_atendimento;
	private String executores;	
	private double valor_servico;
	private String descricao;
	private String observacoes;
	private int status_atendimento;
	private String motivo_cancelamento;

}

