package br.com.sistema_gerencial.services;

import java.util.Map;

import br.com.sistema_gerencial.models.requests.AtualizarEquipamentoRequest;
import br.com.sistema_gerencial.models.requests.CadastrarEquipamentoRequest;
import br.com.sistema_gerencial.models.response.EquipamentoResponse;

public interface EquipamentoService {
	
	/**
	 * Executa o metodo cadastrar.
	 * @param request valor do parametro request.
	 */
	public void cadastrar(CadastrarEquipamentoRequest request);

	/**
	 * Executa o metodo listarPorPagina.
	 * @param limit valor do parametro limit.
	 * @param page valor do parametro page.
	 * @param id_empresa valor do parametro id_empresa.
	 * @return resultado da operacao.
	 */
	public Map<String, Object> listarPorPagina(int limit, int page, int id_empresa);
	
	/**
	 * Executa o metodo buscarPorId.
	 * @param id valor do parametro id.
	 * @return resultado da operacao.
	 */
	public EquipamentoResponse buscarPorId(int id);
	
	/**
	 * Executa o metodo atualizar.
	 * @param request valor do parametro request.
	 */
	public void atualizar(AtualizarEquipamentoRequest request);
	
	/**
	 * Executa o metodo excluir.
	 * @param id valor do parametro id.
	 */
	public void excluir(int id);


}

