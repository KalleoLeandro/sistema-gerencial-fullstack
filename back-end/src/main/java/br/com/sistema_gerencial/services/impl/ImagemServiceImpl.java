package br.com.sistema_gerencial.services.impl;

import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import javax.imageio.ImageIO;

import org.bson.types.Binary;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import br.com.sistema_gerencial.exceptions.DefaultErrorException;
import br.com.sistema_gerencial.models.mongo.ImagemDocumento;
import br.com.sistema_gerencial.models.response.ImagemResponse;
import br.com.sistema_gerencial.repositories.AtendimentoRepository;
import br.com.sistema_gerencial.repositories.AvulsoRepository;
import br.com.sistema_gerencial.repositories.ManutencaoRepository;
import br.com.sistema_gerencial.repositories.ProdutoRepository;
import br.com.sistema_gerencial.services.ImagemService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ImagemServiceImpl implements ImagemService {

	private static final long TAMANHO_MAXIMO_BYTES = 10L * 1024L * 1024L;
	private static final String ENTITY_PRODUTO = "PRODUTO";
	private static final String ENTITY_ATENDIMENTO = "ATENDIMENTO";
	private static final String ENTITY_MANUTENCAO = "MANUTENCAO";
	private static final String ENTITY_AVULSO = "AVULSO";
	private static final String CATEGORIA_PRODUTO_EXIBICAO = "PRODUTO_EXIBICAO";
	private static final String CATEGORIA_PRODUTO_CONTROLE = "PRODUTO_CONTROLE";
	private static final int LIMITE_EXIBICAO_PRODUTO = 300;

	private final MongoTemplate mongoTemplate;
	private final ProdutoRepository produtoRepository;
	private final AtendimentoRepository atendimentoRepository;
	private final ManutencaoRepository manutencaoRepository;
	private final AvulsoRepository avulsoRepository;

	@Override
	public ImagemResponse salvar(String entityType, int entityId, String categoria, Boolean principal, MultipartFile arquivo) {
		String entityTypeNormalizado = normalizar(entityType, "Tipo da entidade e obrigatorio.");
		String categoriaNormalizada = normalizar(categoria, "Categoria da imagem e obrigatoria.");
		validarVinculo(entityTypeNormalizado, entityId);
		validarArquivo(arquivo);

		if (ENTITY_PRODUTO.equals(entityTypeNormalizado) && CATEGORIA_PRODUTO_EXIBICAO.equals(categoriaNormalizada)) {
			excluirCategoriaProdutoExibicao(entityId);
		}

		try {
			ArquivoImagemProcessado arquivoProcessado = processarArquivo(entityTypeNormalizado, categoriaNormalizada, arquivo);
			ImagemDocumento documento = ImagemDocumento.builder()
					.entityType(entityTypeNormalizado)
					.entityId(entityId)
					.categoria(categoriaNormalizada)
					.nomeArquivo(arquivo.getOriginalFilename())
					.contentType(arquivoProcessado.contentType())
					.tamanhoBytes((long) arquivoProcessado.conteudo().length)
					.principal(Boolean.TRUE.equals(principal) || CATEGORIA_PRODUTO_EXIBICAO.equals(categoriaNormalizada))
					.criadoEm(LocalDateTime.now())
					.conteudo(new Binary(arquivoProcessado.conteudo()))
					.build();
			return toResponse(mongoTemplate.save(documento));
		} catch (IOException exception) {
			throw new DefaultErrorException("Nao foi possivel ler o arquivo enviado.", HttpStatus.BAD_REQUEST);
		}
	}

	@Override
	public List<ImagemResponse> listar(String entityType, int entityId, String categoria) {
		String entityTypeNormalizado = normalizar(entityType, "Tipo da entidade e obrigatorio.");
		validarVinculo(entityTypeNormalizado, entityId);
		Query query = Query.query(Criteria.where("entityType").is(entityTypeNormalizado)
				.and("entityId").is(entityId))
			.with(Sort.by(Sort.Order.desc("principal"), Sort.Order.asc("criadoEm")));

		if (categoria != null && !categoria.trim().isEmpty()) {
			query.addCriteria(Criteria.where("categoria").is(normalizar(categoria, "Categoria invalida.")));
		}

		return mongoTemplate.find(query, ImagemDocumento.class).stream()
				.map(this::toResponse)
				.toList();
	}

	@Override
	public ImagemDocumento buscarConteudo(String id) {
		ImagemDocumento imagem = mongoTemplate.findById(id, ImagemDocumento.class);
		if (imagem == null) {
			throw new DefaultErrorException("Imagem nao encontrada.", HttpStatus.NOT_FOUND);
		}
		return imagem;
	}

	@Override
	public void excluir(String id) {
		ImagemDocumento imagem = buscarConteudo(id);
		mongoTemplate.remove(imagem);
	}

	@Override
	public Map<Integer, String> buscarIdsImagemExibicaoProduto(Collection<Integer> entityIds) {
		List<Integer> idsValidos = entityIds == null ? List.of() : entityIds.stream()
				.filter(Objects::nonNull)
				.filter(id -> id > 0)
				.distinct()
				.toList();

		if (idsValidos.isEmpty()) {
			return Map.of();
		}

		Query query = Query.query(Criteria.where("entityType").is(ENTITY_PRODUTO)
				.and("categoria").is(CATEGORIA_PRODUTO_EXIBICAO)
				.and("entityId").in(idsValidos))
			.with(Sort.by(Sort.Order.desc("principal"), Sort.Order.asc("criadoEm")));

		return mongoTemplate.find(query, ImagemDocumento.class).stream()
				.sorted(Comparator.comparing(ImagemDocumento::getCriadoEm, Comparator.nullsLast(Comparator.naturalOrder())))
				.collect(Collectors.toMap(
						ImagemDocumento::getEntityId,
						ImagemDocumento::getId,
						(existing, replacement) -> existing,
						LinkedHashMap::new));
	}

	private void validarVinculo(String entityType, int entityId) {
		if (entityId <= 0) {
			throw new DefaultErrorException("Identificador da entidade e obrigatorio.", HttpStatus.BAD_REQUEST);
		}

		switch (entityType) {
		case ENTITY_PRODUTO -> produtoRepository.buscarPorId(entityId);
		case ENTITY_ATENDIMENTO -> atendimentoRepository.buscarPorId(entityId);
		case ENTITY_MANUTENCAO -> manutencaoRepository.buscarPorId(entityId);
		case ENTITY_AVULSO -> avulsoRepository.buscarPorId(entityId);
		default -> throw new DefaultErrorException("Tipo da entidade invalido.", HttpStatus.BAD_REQUEST);
		}
	}

	private void validarArquivo(MultipartFile arquivo) {
		if (arquivo == null || arquivo.isEmpty()) {
			throw new DefaultErrorException("Envie uma imagem valida.", HttpStatus.BAD_REQUEST);
		}

		if (arquivo.getSize() > TAMANHO_MAXIMO_BYTES) {
			throw new DefaultErrorException("A imagem excede o limite de 10 MB.", HttpStatus.BAD_REQUEST);
		}

		String contentType = arquivo.getContentType();
		if (contentType == null || !contentType.toLowerCase(Locale.ROOT).startsWith("image/")) {
			throw new DefaultErrorException("Apenas arquivos de imagem sao permitidos.", HttpStatus.BAD_REQUEST);
		}
	}

	private void excluirCategoriaProdutoExibicao(int entityId) {
		Query query = Query.query(Criteria.where("entityType").is(ENTITY_PRODUTO)
				.and("entityId").is(entityId)
				.and("categoria").is(CATEGORIA_PRODUTO_EXIBICAO));
		mongoTemplate.remove(query, ImagemDocumento.class);
	}

	private String normalizar(String valor, String mensagem) {
		if (valor == null || valor.trim().isEmpty()) {
			throw new DefaultErrorException(mensagem, HttpStatus.BAD_REQUEST);
		}
		return valor.trim().toUpperCase(Locale.ROOT);
	}

	private ImagemResponse toResponse(ImagemDocumento documento) {
		return ImagemResponse.builder()
				.id(documento.getId())
				.entityType(documento.getEntityType())
				.entityId(documento.getEntityId())
				.categoria(documento.getCategoria())
				.nomeArquivo(documento.getNomeArquivo())
				.contentType(documento.getContentType())
				.tamanhoBytes(documento.getTamanhoBytes())
				.principal(documento.getPrincipal())
				.criadoEm(documento.getCriadoEm())
				.build();
	}

	private ArquivoImagemProcessado processarArquivo(String entityType, String categoria, MultipartFile arquivo) throws IOException {
		byte[] conteudo = arquivo.getBytes();
		String contentType = arquivo.getContentType();

		if (ENTITY_PRODUTO.equals(entityType)
				&& (CATEGORIA_PRODUTO_EXIBICAO.equals(categoria) || CATEGORIA_PRODUTO_CONTROLE.equals(categoria))) {
			return redimensionarImagemExibicao(conteudo, contentType);
		}

		return new ArquivoImagemProcessado(conteudo, contentType);
	}

	private ArquivoImagemProcessado redimensionarImagemExibicao(byte[] conteudoOriginal, String contentTypeOriginal) throws IOException {
		BufferedImage imagemOriginal = ImageIO.read(new ByteArrayInputStream(conteudoOriginal));
		if (imagemOriginal == null) {
			throw new DefaultErrorException("Nao foi possivel processar a imagem enviada.", HttpStatus.BAD_REQUEST);
		}

		int larguraOriginal = imagemOriginal.getWidth();
		int alturaOriginal = imagemOriginal.getHeight();
		if (larguraOriginal <= LIMITE_EXIBICAO_PRODUTO && alturaOriginal <= LIMITE_EXIBICAO_PRODUTO) {
			return new ArquivoImagemProcessado(conteudoOriginal, contentTypeOriginal);
		}

		double escala = Math.min(
				(double) LIMITE_EXIBICAO_PRODUTO / larguraOriginal,
				(double) LIMITE_EXIBICAO_PRODUTO / alturaOriginal);
		int novaLargura = Math.max(1, (int) Math.round(larguraOriginal * escala));
		int novaAltura = Math.max(1, (int) Math.round(alturaOriginal * escala));

		int tipoImagem = "image/png".equalsIgnoreCase(contentTypeOriginal) ? BufferedImage.TYPE_INT_ARGB : BufferedImage.TYPE_INT_RGB;
		BufferedImage imagemRedimensionada = new BufferedImage(novaLargura, novaAltura, tipoImagem);
		Graphics2D graphics = imagemRedimensionada.createGraphics();
		try {
			graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
			graphics.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
			graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
			graphics.drawImage(imagemOriginal, 0, 0, novaLargura, novaAltura, null);
		} finally {
			graphics.dispose();
		}

		String formato = "image/png".equalsIgnoreCase(contentTypeOriginal) ? "png" : "jpg";
		String contentType = "png".equals(formato) ? "image/png" : "image/jpeg";

		try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
			ImageIO.write(imagemRedimensionada, formato, outputStream);
			return new ArquivoImagemProcessado(outputStream.toByteArray(), contentType);
		}
	}

	private record ArquivoImagemProcessado(byte[] conteudo, String contentType) {
	}
}
