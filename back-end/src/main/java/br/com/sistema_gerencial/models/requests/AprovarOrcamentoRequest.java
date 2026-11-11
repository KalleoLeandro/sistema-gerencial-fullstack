package br.com.sistema_gerencial.models.requests;

import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Transporta os dados de entrada para aprovar orçamento na API.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class AprovarOrcamentoRequest {

	private int id_orcamento;
	private String forma_pagamento;
	private Integer quantidade_parcelas;
	@JsonFormat(pattern = "dd/MM/yyyy")
	private LocalDate data_primeiro_vencimento;
	private Integer intervalo_dias;
	private String observacoes;
	private List<PagamentoVendaRequest> pagamentos;
}
