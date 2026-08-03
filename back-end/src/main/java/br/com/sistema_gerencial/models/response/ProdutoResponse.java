package br.com.sistema_gerencial.models.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProdutoResponse {

	private int id;
	private String codigo;
	private String nome;
	private String descricao;
	private String unidade_medida;
	private BigDecimal valor_custo;
	private BigDecimal valor_venda;
	private BigDecimal estoque_atual;
	private BigDecimal estoque_minimo;
	private boolean ativo;
	private String imagem_exibicao_id;
	private LocalDateTime criado_em;
	private LocalDateTime atualizado_em;
}
