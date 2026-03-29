package br.com.sistema_gerencial.models.requests;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AtualizarServicoRequest {

	private int id;
	private String codigo;
	private String nome;
	private String descricao;
	private BigDecimal valor_padrao;
	private Boolean ativo;
}
