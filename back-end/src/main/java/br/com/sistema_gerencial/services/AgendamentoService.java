package br.com.sistema_gerencial.services;

import java.util.Map;

import br.com.sistema_gerencial.models.requests.AtualizarAgendamentoRequest;
import br.com.sistema_gerencial.models.requests.CadastrarAgendamentoRequest;
import br.com.sistema_gerencial.models.response.AgendamentoResponse;

/**
 * Define o contrato das operações de negócio de agendamentos.
 */
public interface AgendamentoService {

	/**
	 * Cadastra um novo registro com os dados informados.
	 *
	 * @param request dados da operação
	 */
	public void cadastrar(CadastrarAgendamentoRequest request);

	/**
	 * Consulta os registros com paginação.
	 *
	 * @param limit quantidade máxima de registros por página
	 * @param page número da página solicitada
	 * @return registros da página e metadados da consulta
	 */
	public Map<String, Object> listarPorPagina(int limit, int page);

	/**
	 * Consulta os detalhes de um registro pelo identificador.
	 *
	 * @param id identificador do registro
	 * @return dados do registro encontrado
	 */
	public AgendamentoResponse buscarPorId(int id);

	/**
	 * Atualiza os dados do registro informado.
	 *
	 * @param request dados da operação
	 */
	public void atualizar(AtualizarAgendamentoRequest request);

	/**
	 * Exclui o registro identificado, respeitando os vínculos e as regras do domínio.
	 *
	 * @param id identificador do registro
	 */
	public void excluir(int id);
}
