package br.com.sistema_gerencial.models.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OutboxEventoDTO {

	private long id;
	private String aggregateType;
	private long aggregateId;
	private String eventType;
	private JsonNode payload;
	private int tentativas;
	private LocalDateTime criadoEm;
}
