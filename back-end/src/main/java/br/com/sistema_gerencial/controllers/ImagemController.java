package br.com.sistema_gerencial.controllers;

import java.util.List;

import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import br.com.sistema_gerencial.models.mongo.ImagemDocumento;
import br.com.sistema_gerencial.models.response.ImagemResponse;
import br.com.sistema_gerencial.services.ImagemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/imagens")
@RequiredArgsConstructor
@Tag(name = "Imagens", description = "Endpoints para upload e consulta de imagens no MongoDB")
public class ImagemController {

	private final ImagemService imagemService;

	@PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@Operation(summary = "Faz upload de uma imagem")
	public ResponseEntity<ImagemResponse> upload(
			@RequestParam String entityType,
			@RequestParam int entityId,
			@RequestParam String categoria,
			@RequestParam(required = false) Boolean principal,
			@RequestParam("arquivo") MultipartFile arquivo) {
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(imagemService.salvar(entityType, entityId, categoria, principal, arquivo));
	}

	@GetMapping("/listar")
	@Operation(summary = "Lista imagens por entidade")
	public ResponseEntity<List<ImagemResponse>> listar(
			@RequestParam String entityType,
			@RequestParam int entityId,
			@RequestParam(required = false) String categoria) {
		return ResponseEntity.status(HttpStatus.OK).body(imagemService.listar(entityType, entityId, categoria));
	}

	@GetMapping("/{id}/conteudo")
	@Operation(summary = "Retorna o binario da imagem")
	public ResponseEntity<byte[]> conteudo(@PathVariable String id) {
		ImagemDocumento imagem = imagemService.buscarConteudo(id);
		byte[] conteudo = imagem.getConteudo().getData();
		return ResponseEntity.status(HttpStatus.OK)
				.contentType(MediaType.parseMediaType(imagem.getContentType()))
				.cacheControl(CacheControl.noCache())
				.header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + imagem.getNomeArquivo() + "\"")
				.body(conteudo);
	}

	@DeleteMapping("/{id}")
	@Operation(summary = "Exclui uma imagem")
	public ResponseEntity<Void> excluir(@PathVariable String id) {
		imagemService.excluir(id);
		return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	}
}
