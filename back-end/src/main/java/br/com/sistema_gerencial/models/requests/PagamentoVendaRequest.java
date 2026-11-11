package br.com.sistema_gerencial.models.requests;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Transporta os dados de entrada para pagamento venda na API.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class PagamentoVendaRequest {

	private Integer numero_parcela;
	@JsonFormat(pattern = "dd/MM/yyyy HH:mm")
	private LocalDateTime data_pagamento;
	private String forma_pagamento;
	private BigDecimal valor_pago;
	private BigDecimal valor_entregue;
	private String observacoes;
}
