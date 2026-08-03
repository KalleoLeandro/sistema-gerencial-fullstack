package br.com.sistema_gerencial.models.requests;

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
public class CriarOrcamentoRequest {

	private String origem_tipo;
	private Integer origem_id;
	private String cliente_nome;
	private String cliente_documento;
	private String observacoes;
}
