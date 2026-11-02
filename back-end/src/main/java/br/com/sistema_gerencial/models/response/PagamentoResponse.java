package br.com.sistema_gerencial.models.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Transporta os dados de pagamento retornados pela API.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PagamentoResponse {

	private int id;
	private String codigo;
	private int id_parcela;
	private LocalDateTime data_pagamento;
	private String forma_pagamento;
	private BigDecimal valor_pago;
	private BigDecimal valor_entregue;
	private BigDecimal troco;
	private String observacoes;
	private LocalDateTime criado_em;
}
