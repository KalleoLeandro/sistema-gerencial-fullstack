package br.com.sistema_gerencial.models.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Transporta os dados de orçamento item retornados pela API.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrcamentoItemResponse {

	private int id;
	private String tipo_item;
	private Integer id_produto;
	private Integer id_servico;
	private String descricao;
	private BigDecimal quantidade;
	private BigDecimal valor_unitario;
	private BigDecimal percentual_desconto;
	private BigDecimal valor_desconto;
	private BigDecimal valor_total;
	private int ordem;
	private LocalDateTime criado_em;
	private LocalDateTime atualizado_em;
}
