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
	private String observacoes;
	private List<OrcamentoItemRequest> itens;
}
