package br.com.sistema_gerencial.models.requests;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Transporta os dados de entrada para cadastrar manutenção na API.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class CadastrarManutencaoRequest {
	
	private int id_equipamento;
	@JsonFormat(pattern = "dd/MM/yyyy HH:mm")
	private LocalDateTime data_inicio;
	@JsonFormat(pattern = "dd/MM/yyyy HH:mm")
    private LocalDateTime data_fim;
	private String tipo_atendimento;
    private String tipo_servico;
    private double valor_servico;
    private String descricao;
    private String executores;
    private String observacoes;
}

