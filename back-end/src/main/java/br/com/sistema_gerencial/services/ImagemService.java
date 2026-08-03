package br.com.sistema_gerencial.services;

import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

import br.com.sistema_gerencial.models.mongo.ImagemDocumento;
import br.com.sistema_gerencial.models.response.ImagemResponse;

public interface ImagemService {

	ImagemResponse salvar(String entityType, int entityId, String categoria, Boolean principal, MultipartFile arquivo);

	List<ImagemResponse> listar(String entityType, int entityId, String categoria);

	ImagemDocumento buscarConteudo(String id);

	void excluir(String id);

	Map<Integer, String> buscarIdsImagemExibicaoProduto(Collection<Integer> entityIds);
}
