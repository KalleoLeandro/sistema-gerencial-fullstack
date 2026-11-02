package br.com.sistema_gerencial.models.response;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Transporta os dados de caixa resumo pagamento retornados pela API.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CaixaResumoPagamentoResponse {

	private String forma_pagamento;
	private BigDecimal valor_total;
	private BigDecimal valor_recebido;
	private BigDecimal valor_entregue;
	private BigDecimal troco;
}
