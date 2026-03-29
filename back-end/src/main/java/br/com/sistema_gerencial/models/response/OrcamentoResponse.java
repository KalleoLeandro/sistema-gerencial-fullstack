package br.com.sistema_gerencial.models.response;

import java.math.BigDecimal;
import java.time.LocalDate;
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
public class OrcamentoResponse {

	private int id;
	private String codigo;
	private String origem_tipo;
	private Integer id_atendimento;
	private Integer id_manutencao;
	private Integer id_avulso;
	private String cliente_nome;
	private String cliente_documento;
	private String status;
	private LocalDate validade_em;
	private LocalDateTime aprovado_em;
	private BigDecimal desconto_financeiro;
	private BigDecimal acrescimo_financeiro;
	private BigDecimal subtotal;
	private BigDecimal total_desconto;
	private BigDecimal total_acrescimo;
	private BigDecimal total_geral;
	private String observacoes;
	private LocalDateTime criado_em;
	private LocalDateTime atualizado_em;
	private List<OrcamentoItemResponse> itens;
}
