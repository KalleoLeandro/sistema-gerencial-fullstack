package br.com.sistema_gerencial.services;

import java.util.Map;

import br.com.sistema_gerencial.models.requests.AtualizarAvulsoRequest;
import br.com.sistema_gerencial.models.requests.CadastrarAvulsoRequest;
import br.com.sistema_gerencial.models.response.AvulsoResponse;

/**
 * Define o contrato das operações de negócio de serviços avulsos.
 */
public interface AvulsoService {
	
	/**
	 * Executa o metodo cadastrar.
	 * @param request valor do parametro request.
	 */
	public void cadastrar(CadastrarAvulsoRequest request);
	
	/**
	 * Executa o metodo listarPorPagina.
	 * @param limit valor do parametro limit.
	 * @param page valor do parametro page.
	 * @return resultado da operacao.
	 */
	public Map<String, Object> listarPorPagina(int limit, int page);
	/**
	 * Executa o metodo listarPorAtributoEPagina.
	 * @param limit valor do parametro limit.
	 * @param page valor do parametro page.
	 * @param pesquisa valor do parametro pesquisa.
	 * @param tipoConsulta valor do parametro tipoConsulta.
	 * @return resultado da operacao.
	 */
	public Map<String, Object> listarPorAtributoEPagina(int limit, int page, String pesquisa, String tipoConsulta);
	
	/**
	 * Executa o metodo buscarPorId.
	 * @param id valor do parametro id.
	 * @return resultado da operacao.
	 */
	public AvulsoResponse buscarPorId(int id);
	
	/**
	 * Executa o metodo atualizar.
	 * @param request valor do parametro request.
	 */
	public void atualizar(AtualizarAvulsoRequest request);
	
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

