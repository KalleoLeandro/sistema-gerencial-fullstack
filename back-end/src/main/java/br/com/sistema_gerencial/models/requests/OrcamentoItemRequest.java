package br.com.sistema_gerencial.models.requests;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Transporta os dados de entrada para orçamento item na API.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class OrcamentoItemRequest {

	private String tipo_item;
	private Integer id_produto;
	private Integer id_servico;
	private String descricao;
	private BigDecimal quantidade;
	private BigDecimal valor_unitario;
	private BigDecimal percentual_desconto;
	private BigDecimal valor_desconto;
	private Integer ordem;
}
