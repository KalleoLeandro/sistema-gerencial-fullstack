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
public class RenovacaoContratoResponse {

	private int id;
	private int id_cliente;
	private LocalDateTime data_inicio_anterior;
	private LocalDateTime data_fim_anterior;
	private LocalDateTime data_inicio_novo;
	private LocalDateTime data_fim_novo;
	private String observacoes;
	private LocalDateTime criado_em;
}
