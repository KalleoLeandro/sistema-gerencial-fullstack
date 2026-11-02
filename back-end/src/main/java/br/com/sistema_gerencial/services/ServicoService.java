package br.com.sistema_gerencial.services;

import java.util.List;
import java.util.Map;

import br.com.sistema_gerencial.models.requests.AtualizarServicoRequest;
import br.com.sistema_gerencial.models.requests.CadastrarServicoRequest;
import br.com.sistema_gerencial.models.response.ServicoResponse;

/**
 * Define o contrato das operações de negócio de serviços do catálogo.
 */
public interface ServicoService {

	/**
	 * Cadastra um novo registro com os dados informados.
	 *
	 * @param request dados da operação
	 */
	void cadastrar(CadastrarServicoRequest request);

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
	List<ServicoResponse> listarAtivos();

	/**
	 * Consulta os detalhes de um registro pelo identificador.
	 *
	 * @param id identificador do registro
	 * @return dados do registro encontrado
	 */
	ServicoResponse buscarPorId(int id);

	/**
	 * Atualiza os dados do registro informado.
	 *
	 * @param request dados da operação
	 */
	void atualizar(AtualizarServicoRequest request);

	/**
	 * Exclui o registro identificado, respeitando os vínculos e as regras do domínio.
	 *
	 * @param id identificador do registro
	 */
	void excluir(int id);
}
