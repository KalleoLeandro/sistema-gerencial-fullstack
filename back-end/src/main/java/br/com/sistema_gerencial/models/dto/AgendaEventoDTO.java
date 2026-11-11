package br.com.sistema_gerencial.models.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Transporta um evento exibido na agenda, com origem, período e dados de apresentação.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgendaEventoDTO {

	private String tipo;
	private Integer referenciaId;
	private Integer empresaId;
	private String titulo;
	private String subtitulo;
	private LocalDateTime dataEvento;
	private Boolean concluido;
}

