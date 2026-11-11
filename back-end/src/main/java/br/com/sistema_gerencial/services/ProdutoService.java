package br.com.sistema_gerencial.services;

import java.util.List;
import java.util.Map;

import br.com.sistema_gerencial.models.requests.AtualizarProdutoRequest;
import br.com.sistema_gerencial.models.requests.CadastrarProdutoRequest;
import br.com.sistema_gerencial.models.response.ProdutoResponse;

/**
 * Define o contrato das operações de negócio de produtos e estoque.
 */
public interface ProdutoService {

	/**
	 * Cadastra um novo registro com os dados informados.
	 *
	 * @param request dados da operação
	 * @return identificador do registro cadastrado
	 */
	int cadastrar(CadastrarProdutoRequest request);

	/**
	 * Consulta os registros com paginação.
	 *
	 * @param limit quantidade máxima de registros por página
	 * @param page número da página solicitada
	 * @return registros da página e metadados da consulta
	 */
	Map<String, Object> listarPorPagina(int limit, int page);

	/**
	 * Consulta os registros ativos disponíveis para uso.
	 *
	 * @return registros ativos
	 */
	List<ProdutoResponse> listarAtivos();

	/**
	 * Consulta os produtos cujo estoque atual está abaixo do estoque mínimo.
	 *
	 * @return produtos que precisam de reposição
	 */
	List<ProdutoResponse> listarEmFalta();

	/**
	 * Consulta os detalhes de um registro pelo identificador.
	 *
	 * @param id identificador do registro
	 * @return dados do registro encontrado
	 */
	ProdutoResponse buscarPorId(int id);

	/**
	 * Atualiza os dados do registro informado.
	 *
	 * @param request dados da operação
	 */
	void atualizar(AtualizarProdutoRequest request);

	/**
	 * Exclui o registro identificado, respeitando os vínculos e as regras do domínio.
	 *
	 * @param id identificador do registro
	 */
	void excluir(int id);
}
