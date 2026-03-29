package br.com.sistema_gerencial.models.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendaResponse {

	private int id;
	private String codigo;
	private int id_orcamento;
	private String origem_tipo;
	private String cliente_nome;
	private String cliente_documento;
	private String status;
	private LocalDateTime data_venda;
	private String forma_pagamento;
	private int quantidade_parcelas;
	private BigDecimal subtotal;
	private BigDecimal total_desconto;
	private BigDecimal total_acrescimo;
	private BigDecimal total_geral;
	private String observacoes;
	private LocalDateTime criado_em;
	private LocalDateTime atualizado_em;
	private List<OrcamentoItemResponse> itens;
	private List<ParcelaResponse> parcelas;
}
