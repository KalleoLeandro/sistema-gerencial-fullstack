package br.com.sistema_gerencial.models.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContratoCalendarioDTO {

	private Integer idEmpresa;
	private String nomeFantasia;
	private String razaoSocial;
	private LocalDateTime dataFim;
	private Long diasParaEncerrar;
}

