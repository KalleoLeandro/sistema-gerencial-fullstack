package br.com.sistema_gerencial.models.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Transporta os dados de servico retornados pela API.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServicoResponse {

	private int id;
	private String codigo;
	private String nome;
	private String descricao;
	private BigDecimal valor_padrao;
	private boolean ativo;
	private LocalDateTime criado_em;
	private LocalDateTime atualizado_em;
}
