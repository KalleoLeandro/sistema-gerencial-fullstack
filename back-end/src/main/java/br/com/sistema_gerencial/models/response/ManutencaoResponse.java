package br.com.sistema_gerencial.models.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class ManutencaoResponse {
	
	private int id;
	private int id_equipamento;
	private LocalDateTime data_inicio;
	private LocalDateTime data_fim;
	private String tipo_servico;
	private String tipo_atendimento;
	private double valor_servico;
	private String descricao;
	private String observacoes;
	private String executores;
	private int status_atendimento; 
	private String motivo_cancelamento;
	

}

