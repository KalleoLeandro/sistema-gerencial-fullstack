package br.com.sistema_gerencial.models.requests;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class CadastrarAtendimentoRequest {
	
	private int id_empresa;
	@JsonFormat(pattern = "dd/MM/yyyy HH:mm")
	private LocalDateTime data_inicio;
	@JsonFormat(pattern = "dd/MM/yyyy HH:mm")
    private LocalDateTime data_fim;
    private String solicitante;
    private String tipo_atendimento;
    private String executores;
    private double valor_servico;
    private String descricao;
    private String observacoes;
}

