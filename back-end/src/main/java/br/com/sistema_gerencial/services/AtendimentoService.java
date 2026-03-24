package br.com.sistema_gerencial.services;

import java.util.Map;

import br.com.sistema_gerencial.models.requests.AtualizarAtendimentoRequest;
import br.com.sistema_gerencial.models.requests.CadastrarAtendimentoRequest;
import br.com.sistema_gerencial.models.response.AtendimentoResponse;

public interface AtendimentoService {

	/**
	 * Executa o metodo cadastrar.
	 * @param request valor do parametro request.
	 */
	public void cadastrar(CadastrarAtendimentoRequest request);

	/**
	 * Executa o metodo listarPorPagina.
	 * @param limit valor do parametro limit.
	 * @param page valor do parametro page.
	 * @param id valor do parametro id.
	 * @return resultado da operacao.
	 */
	public Map<String, Object> listarPorPagina(int limit, int page, int id);

	/**
	 * Executa o metodo buscarPorId.
	 * @param id valor do parametro id.
	 * @return resultado da operacao.
	 */
	public AtendimentoResponse buscarPorId(int id);
	
	/**
	 * Executa o metodo atualizar.
	 * @param request valor do parametro request.
	 */
	public void atualizar(AtualizarAtendimentoRequest request);
	
	/**
	 * Executa o metodo alterarStatus.
	 * @param id valor do parametro id.
	 * @param status valor do parametro status.
	 * @param motivo_cancelamento valor do parametro motivo_cancelamento.
	 */
	public void alterarStatus(int id, int status, String motivo_cancelamento);
	
	/**
	 * Executa o metodo excluir.
	 * @param id valor do parametro id.
	 */
	public void excluir(int id);
}

