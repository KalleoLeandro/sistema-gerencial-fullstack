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
 * Transporta os dados de caixa fechamento retornados pela API.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CaixaFechamentoResponse {

	private Integer id;
	private LocalDate data_referencia;
	private LocalDateTime fechado_em;
	private BigDecimal valor_total;
	private BigDecimal valor_informado;
	private BigDecimal valor_quebra;
	private String observacoes;
	private List<CaixaResumoPagamentoResponse> itens;
}
