package br.com.sistema_gerencial.models.requests;

import java.math.BigDecimal;

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
public class FecharCaixaItemRequest {

	private String forma_pagamento;
	private BigDecimal valor_informado;
}
