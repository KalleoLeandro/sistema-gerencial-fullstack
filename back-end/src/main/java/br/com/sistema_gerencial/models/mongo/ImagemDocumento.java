package br.com.sistema_gerencial.models.mongo;

import java.time.LocalDateTime;

import org.bson.types.Binary;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Armazena no MongoDB o conteúdo binário e os metadados de uma imagem vinculada a uma entidade.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "imagens")
public class ImagemDocumento {

	@Id
	private String id;
	private String entityType;
	private Integer entityId;
	private String categoria;
	private String nomeArquivo;
	private String contentType;
	private Long tamanhoBytes;
	private Boolean principal;
	private LocalDateTime criadoEm;
	private Binary conteudo;
}
