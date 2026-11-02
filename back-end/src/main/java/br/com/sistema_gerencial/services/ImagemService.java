package br.com.sistema_gerencial.services;

import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

import br.com.sistema_gerencial.models.mongo.ImagemDocumento;
import br.com.sistema_gerencial.models.response.ImagemResponse;

/**
 * Define o contrato das operações de negócio de imagens vinculadas às entidades.
 */
public interface ImagemService {

	/**
	 * Armazena a imagem e associa seus metadados à entidade indicada.
	 *
	 * @param entityType tipo da entidade à qual a imagem pertence
	 * @param entityId identificador da entidade à qual a imagem pertence
	 * @param categoria categoria utilizada para classificar a imagem
	 * @param principal indica se a imagem deve ser a principal da entidade
	 * @param arquivo arquivo de imagem enviado
	 * @return metadados da imagem armazenada
	 */
	ImagemResponse salvar(String entityType, int entityId, String categoria, Boolean principal, MultipartFile arquivo);

	/**
	 * Consulta as imagens vinculadas à entidade e à categoria informadas.
	 *
	 * @param entityType tipo da entidade à qual a imagem pertence
	 * @param entityId identificador da entidade à qual a imagem pertence
	 * @param categoria categoria utilizada para classificar a imagem
	 * @return metadados das imagens encontradas
	 */
	List<ImagemResponse> listar(String entityType, int entityId, String categoria);

	/**
	 * Recupera os metadados e o conteúdo binário de uma imagem.
	 *
	 * @param id identificador do registro
	 * @return documento que contém a imagem
	 */
	ImagemDocumento buscarConteudo(String id);

	/**
	 * Exclui o registro identificado, respeitando os vínculos e as regras do domínio.
	 *
	 * @param id identificador do registro
	 */
	void excluir(String id);

	/**
	 * Seleciona a imagem de exibição de cada produto informado.
	 *
	 * @param entityIds identificadores dos produtos que precisam de imagem de exibição
	 * @return identificador de produto associado ao identificador da imagem
	 */
	Map<Integer, String> buscarIdsImagemExibicaoProduto(Collection<Integer> entityIds);
}
