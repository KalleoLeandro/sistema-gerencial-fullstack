package br.com.sistema_gerencial.models.requests;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Transporta os dados de entrada para cadastrar servico na API.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CadastrarServicoRequest {

	private String codigo;
	private String nome;
	private String descricao;
	private BigDecimal valor_padrao;
	private Boolean ativo;
}
