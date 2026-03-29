package br.com.sistema_gerencial.models.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrigemComercialDTO {

	private int origemId;
	private String origemTipo;
	private String clienteNome;
	private String clienteDocumento;
	private String observacoes;
}
