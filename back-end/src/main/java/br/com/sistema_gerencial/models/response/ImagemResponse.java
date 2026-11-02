package br.com.sistema_gerencial.models.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Transporta os dados de imagem retornados pela API.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImagemResponse {

	private String id;
	private String entityType;
	private Integer entityId;
	private String categoria;
	private String nomeArquivo;
	private String contentType;
	private Long tamanhoBytes;
	private Boolean principal;
	private LocalDateTime criadoEm;
}
