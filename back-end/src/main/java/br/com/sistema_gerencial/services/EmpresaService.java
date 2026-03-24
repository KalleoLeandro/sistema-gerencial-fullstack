package br.com.sistema_gerencial.services;

import java.util.Map;

import br.com.sistema_gerencial.models.requests.AtualizarEmpresaRequest;
import br.com.sistema_gerencial.models.requests.CadastrarEmpresaRequest;
import br.com.sistema_gerencial.models.response.EmpresaResponse;

public interface EmpresaService {
	
	/**
	 * Executa o metodo cadastrar.
	 * @param request valor do parametro request.
	 */
	public void cadastrar(CadastrarEmpresaRequest request);
	
	/**
	 * Executa o metodo listarPorPagina.
	 * @param limit valor do parametro limit.
	 * @param page valor do parametro page.
	 * @return resultado da operacao.
	 */
	public Map<String, Object> listarPorPagina(int limit, int page);
	/**
	 * Executa o metodo listarPorPaginaENome.
	 * @param limit valor do parametro limit.
	 * @param page valor do parametro page.
	 * @param nome valor do parametro nome.
	 * @return resultado da operacao.
	 */
	public Map<String, Object> listarPorPaginaENome(int limit, int page, String nome);
	
	/**
	 * Executa o metodo atualizar.
	 * @param request valor do parametro request.
	 */
	public void atualizar(AtualizarEmpresaRequest request);
	
	/**
	 * Executa o metodo excluir.
	 * @param id valor do parametro id.
	 */
	public void excluir(int id);
	
	/**
	 * Executa o metodo buscarPorId.
	 * @param id valor do parametro id.
	 * @return resultado da operacao.
	 */
	public EmpresaResponse buscarPorId(int id);
	
	/**
	 * Executa o metodo salvarInfraestrutura.
	 * @param texto valor do parametro texto.
	 * @param id valor do parametro id.
	 */
	public void salvarInfraestrutura(String texto, int id);

}

