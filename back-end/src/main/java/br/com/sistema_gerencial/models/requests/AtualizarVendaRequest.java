package br.com.sistema_gerencial.models.requests;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Transporta os dados de entrada para atualizar venda na API.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class AtualizarVendaRequest {

	private int id_venda;
	private String cliente_nome;
	private String cliente_documento;
	private String forma_pagamento;
	private String observacoes;
	private List<PagamentoVendaRequest> pagamentos;
	private List<OrcamentoItemRequest> itens;
}
