package br.com.sistema_gerencial.models.requests;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Transporta os dados de entrada para atualizar produto na API.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AtualizarProdutoRequest {

	private int id;
	private String codigo;
	private String nome;
	private String descricao;
	private String unidade_medida;
	private BigDecimal valor_custo;
	private BigDecimal valor_venda;
	private BigDecimal estoque_atual;
	private BigDecimal estoque_minimo;
	private Boolean ativo;
}
