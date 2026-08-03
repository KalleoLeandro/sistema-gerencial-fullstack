package br.com.sistema_gerencial.models.requests;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

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
public class FecharCaixaRequest {

	private LocalDate data_referencia;
	private BigDecimal valor_informado;
	private String observacoes;
	private List<FecharCaixaItemRequest> itens;
}
