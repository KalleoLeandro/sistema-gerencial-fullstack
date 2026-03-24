package br.com.sistema_gerencial.services;

import java.util.List;
import java.util.Map;

import br.com.sistema_gerencial.models.requests.AtualizarLoginRequest;
import br.com.sistema_gerencial.models.requests.CadastroLoginRequest;
import br.com.sistema_gerencial.models.requests.LoginRequest;
import br.com.sistema_gerencial.models.response.ExecutorResponse;
import br.com.sistema_gerencial.models.response.LoginAtualizacaoResponse;
import br.com.sistema_gerencial.models.response.LoginResponse;

public interface LoginService {
	
	/**
	 * Executa o metodo validarLogin.
	 * @param request valor do parametro request.
	 * @return resultado da operacao.
	 */
	public LoginResponse validarLogin(LoginRequest request);

	/**
	 * Executa o metodo atualizarToken.
	 * @param refreshToken valor do parametro refreshToken.
	 * @return resultado da operacao.
	 */
	public LoginResponse atualizarToken(String refreshToken);
	
	/**
	 * Executa o metodo validarToken.
	 * @param token valor do parametro token.
	 * @return resultado da operacao.
	 */
	public boolean validarToken(String token);
	
	/**
	 * Executa o metodo cadastrar.
	 * @param request valor do parametro request.
	 */
	public void cadastrar(CadastroLoginRequest request);
	
	/**
	 * Executa o metodo listarPorPagina.
	 * @param limit valor do parametro limit.
	 * @param page valor do parametro page.
	 * @return resultado da operacao.
	 */
	public Map<String, Object> listarPorPagina(int limit, int page);
	
	/**
	 * Executa o metodo listarTodos.
	 * @return resultado da operacao.
	 */
	public List<ExecutorResponse> listarTodos();
	
	/**
	 * Executa o metodo buscarPorId.
	 * @param id valor do parametro id.
	 * @return resultado da operacao.
	 */
	public LoginAtualizacaoResponse buscarPorId(int id);
	
	/**
	 * Executa o metodo buscarPorNome.
	 * @param nome valor do parametro nome.
	 * @return resultado da operacao.
	 */
	public List<ExecutorResponse> buscarPorNome(String nome);
	
	/**
	 * Executa o metodo buscarPorToken.
	 * @return resultado da operacao.
	 */
	public ExecutorResponse buscarPorToken();
	
	/**
	 * Executa o metodo atualizar.
	 * @param request valor do parametro request.
	 */
	public void atualizar(AtualizarLoginRequest request);
	
	/**
	 * Executa o metodo excluir.
	 * @param id valor do parametro id.
	 */
	public void excluir(int id);
	
	/**
	 * Executa o metodo retornarPerfil.
	 * @return resultado da operacao.
	 */
	public Map<String, String> retornarPerfil();
	
	

}

