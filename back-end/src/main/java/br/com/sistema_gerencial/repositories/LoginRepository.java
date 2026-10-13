package br.com.sistema_gerencial.repositories;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.dao.DataAccessException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import br.com.sistema_gerencial.exceptions.DefaultErrorException;
import br.com.sistema_gerencial.models.dto.LoginDTO;
import br.com.sistema_gerencial.models.dto.LoginListaDTO;
import br.com.sistema_gerencial.models.requests.AtualizarLoginRequest;
import br.com.sistema_gerencial.models.requests.CadastroLoginRequest;
import br.com.sistema_gerencial.models.response.ExecutorResponse;
import br.com.sistema_gerencial.models.response.LoginAtualizacaoResponse;
import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class LoginRepository {

	private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;

	final RowMapper<LoginDTO> loginMapper = (rs, rowNum) -> LoginDTO.builder().nome(rs.getString("nome"))
			.login(rs.getString("login")).senha(rs.getString("senha")).perfil(rs.getString("perfil")).build();
	
	final RowMapper<ExecutorResponse> executorMapper = (rs, rowNum) -> ExecutorResponse.builder()
			.id(rs.getInt("id"))
			.nome(rs.getString("nome")).build();
	
	final RowMapper<LoginAtualizacaoResponse> loginAtualizacaoMapper = (rs, rowNum) -> LoginAtualizacaoResponse
			.builder()
			.id(rs.getInt("id"))
			.nome(rs.getString("nome"))
			.login(rs.getString("login"))			
			.perfil(rs.getString("perfil")).build();
	
	final RowMapper<LoginListaDTO> loginListaMapper = (rs, rowNum) -> LoginListaDTO.builder()
		.id(rs.getInt("id"))
		.nome(rs.getString("nome"))
		.login(rs.getString("login")).build();

	
	/**
	 * Executa o metodo buscarPorLoginESenha.
	 * @param login valor do parametro login.
	 * @param senha valor do parametro senha.
	 * @return resultado da operacao.
	 */
	public LoginDTO buscarPorLoginESenha(String login, String senha) {

		String sql = "SELECT nome, login, senha, perfil FROM login WHERE login = :login AND senha = :senha";

		MapSqlParameterSource params = new MapSqlParameterSource().addValue("login", login).addValue("senha", senha);

		try {
			return namedParameterJdbcTemplate.<LoginDTO>queryForObject(sql, params, loginMapper);
		} catch (EmptyResultDataAccessException e) {
			return null;
		} catch (DataAccessException e) {
			throw new DefaultErrorException("Erro ao consultar os dados na base", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	
	/**
	 * Executa o metodo buscarPorId.
	 * @param id valor do parametro id.
	 * @return resultado da operacao.
	 */
	public LoginAtualizacaoResponse buscarPorId(int id) {

		String sql = "SELECT id, nome, login, perfil FROM login WHERE id = :id";

		MapSqlParameterSource params = new MapSqlParameterSource().addValue("id", id);

		try {
			return namedParameterJdbcTemplate.<LoginAtualizacaoResponse>queryForObject(sql, params, loginAtualizacaoMapper);
		} catch (EmptyResultDataAccessException e) {			
			throw new DefaultErrorException("Nenhum login encontrado.", HttpStatus.NO_CONTENT);
		} catch (DataAccessException e) {
			throw new DefaultErrorException("Erro ao consultar os dados na base", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	/**
	 * Executa o metodo buscarPorNome.
	 * @param nome valor do parametro nome.
	 * @return resultado da operacao.
	 */
	public List<ExecutorResponse> buscarPorNome(String nome) {

		String sql = "SELECT id, nome FROM login WHERE nome like :nome";
		MapSqlParameterSource params = new MapSqlParameterSource().addValue("nome", "%" + nome + "%");

		try {
			return namedParameterJdbcTemplate.<ExecutorResponse>query(sql, params, executorMapper);
		} catch (EmptyResultDataAccessException e) {			
			throw new DefaultErrorException("Nenhum login encontrado.", HttpStatus.NO_CONTENT);
		} catch (DataAccessException e) {
			throw new DefaultErrorException("Erro ao consultar os dados na base", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	/**
	 * Executa o metodo buscarPorLogin.
	 * @param login valor do parametro login.
	 * @return resultado da operacao.
	 */
	public ExecutorResponse buscarPorLogin(String login) {

		String sql = "SELECT id, nome FROM login WHERE login = :login";
		MapSqlParameterSource params = new MapSqlParameterSource().addValue("login", login);

		try {
			return namedParameterJdbcTemplate.<ExecutorResponse>queryForObject(sql, params, executorMapper);
		} catch (EmptyResultDataAccessException e) {			
			throw new DefaultErrorException("Nenhum login encontrado.", HttpStatus.NO_CONTENT);
		} catch (DataAccessException e) {
			throw new DefaultErrorException("Erro ao consultar os dados na base", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	
	/**
	 * Executa o metodo cadastrarLogin.
	 * @param request valor do parametro request.
	 * @return resultado da operacao.
	 */
	public int cadastrarLogin(CadastroLoginRequest request) {
		KeyHolder keyHolder = new GeneratedKeyHolder();
		String sql = "INSERT INTO login(nome,login, senha, perfil) values(:nome, :login, :senha, :perfil)";
		MapSqlParameterSource params = new MapSqlParameterSource().addValue("nome", request.getNome())
				.addValue("login", request.getLogin()).addValue("senha", request.getSenha())
				.addValue("perfil", request.getPerfil());
		try {
			namedParameterJdbcTemplate.update(sql, params, keyHolder, new String[] { "id" });
			return keyHolder.getKey().intValue();
		} catch (DataAccessException e) {
			e.printStackTrace();
			throw new DefaultErrorException("Erro ao gravar os dados na base", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	
	/**
	 * Executa o metodo listarPorPagina.
	 * @param limit valor do parametro limit.
	 * @param page valor do parametro page.
	 * @return resultado da operacao.
	 */
	public Map<String, Object> listarPorPagina(Integer limit, Integer page) {
		String sqlList = "SELECT * FROM login WHERE id <> 1 ORDER BY nome DESC LIMIT :limit OFFSET :offset";
		MapSqlParameterSource params = new MapSqlParameterSource()				
				.addValue("limit", limit)
				.addValue("offset", (page - 1) * limit);

		try {
			List<LoginListaDTO> lista = namedParameterJdbcTemplate.query(sqlList, params, loginListaMapper);

			String sqlCount = "SELECT COUNT(id) FROM login";			
			Integer total = namedParameterJdbcTemplate.queryForObject(sqlCount, new MapSqlParameterSource(),
					Integer.class) - 1;

			Map<String, Object> resultado = new HashMap<>();
			resultado.put("lista", lista);
			resultado.put("total", total);

			return resultado;

		} catch (EmptyResultDataAccessException e) {
			throw new DefaultErrorException("Nenhum histÃ³rico encontrado.", HttpStatus.NO_CONTENT);
		} catch (DataAccessException e) {
			e.printStackTrace();
			throw new DefaultErrorException("Erro ao consultar o histÃ³rico do equipamento na base de dados.",
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	/**
	 * Executa o metodo listarTodos.
	 * @return resultado da operacao.
	 */
	public List<ExecutorResponse> listarTodos() {
		String sqlList = "SELECT login.id, login.nome FROM login WHERE id <> 1 ORDER BY id DESC";
		try {
			List<ExecutorResponse> lista = namedParameterJdbcTemplate.query(sqlList, executorMapper);
			return lista;

		} catch (EmptyResultDataAccessException e) {
			throw new DefaultErrorException("Nenhum histÃ³rico encontrado.", HttpStatus.NO_CONTENT);
		} catch (DataAccessException e) {
			e.printStackTrace();
			throw new DefaultErrorException("Erro ao consultar o histÃ³rico do equipamento na base de dados.",
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	
	/**
	 * Executa o metodo atualizar.
	 * @param request valor do parametro request.
	 */
	public void atualizar(AtualizarLoginRequest request) {
		String sql = "UPDATE login set nome = :nome, login = :login, senha = :senha, perfil = :perfil WHERE id = :id";
		
		MapSqlParameterSource params = new MapSqlParameterSource()
				.addValue("nome", request.getNome())
				.addValue("login", request.getLogin())
				.addValue("senha", request.getSenha())							
				.addValue("perfil", request.getPerfil())
				.addValue("id", request.getId());
		try {
			namedParameterJdbcTemplate.update(sql, params);
		} catch (DataAccessException e) {
			e.printStackTrace();
			throw new DefaultErrorException("Erro ao gravar os dados na base", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	
	/**
	 * Executa o metodo excluir.
	 * @param id valor do parametro id.
	 */
	public void excluir(Integer id) {
		String sql = "DELETE FROM login WHERE id = :id";
		MapSqlParameterSource params = new MapSqlParameterSource().addValue("id", id);
		try {
			namedParameterJdbcTemplate.update(sql, params);
		} catch (DataAccessException e) {		
			e.printStackTrace();
			throw new DefaultErrorException("Erro ao excluir o dado na base", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}

