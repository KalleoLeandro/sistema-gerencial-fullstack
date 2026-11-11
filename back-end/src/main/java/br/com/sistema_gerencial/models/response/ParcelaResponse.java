package br.com.sistema_gerencial.models.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Transporta os dados de parcela retornados pela API.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParcelaResponse {

	private int id;
	private int numero_parcela;
	private LocalDate data_vencimento;
	private String status;
	private BigDecimal valor_previsto;
	private BigDecimal valor_pago;
	private BigDecimal saldo_aberto;
	private LocalDateTime data_ultimo_pagamento;
	private String observacoes;
	private List<PagamentoResponse> pagamentos;
}
