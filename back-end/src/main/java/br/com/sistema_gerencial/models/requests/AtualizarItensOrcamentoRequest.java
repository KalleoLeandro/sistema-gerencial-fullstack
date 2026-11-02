package br.com.sistema_gerencial.models.requests;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Transporta os dados de entrada para atualizar itens orçamento na API.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class AtualizarItensOrcamentoRequest {

	private int id_orcamento;
	@JsonFormat(pattern = "dd/MM/yyyy")
	private LocalDate validade_em;
	private BigDecimal desconto_financeiro;
	private BigDecimal acrescimo_financeiro;
	private String cliente_nome;
	private String cliente_documento;
	private String observacoes;
	private List<OrcamentoItemRequest> itens;
}
