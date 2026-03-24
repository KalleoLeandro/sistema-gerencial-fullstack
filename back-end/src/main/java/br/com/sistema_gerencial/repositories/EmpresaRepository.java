package br.com.sistema_gerencial.repositories;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.dao.DataAccessException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import org.springframework.jdbc.core.RowMapper;

import br.com.sistema_gerencial.exceptions.DefaultErrorException;
import br.com.sistema_gerencial.models.requests.AtualizarEmpresaRequest;
import br.com.sistema_gerencial.models.requests.CadastrarEmpresaRequest;
import br.com.sistema_gerencial.models.response.EmpresaResponse;
import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class EmpresaRepository {

	private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;

	final RowMapper<EmpresaResponse> empresaMapper = (rs, rowNum) -> EmpresaResponse.builder().id(rs.getInt("id"))
			.nome_fantasia(rs.getString("nome_fantasia"))
			.razao_social(rs.getString("razao_social"))
			.cnpj(rs.getString("cnpj")).inscricao(rs.getString("inscricao"))
			.data_inicio(
					rs.getTimestamp("data_inicio") != null ? rs.getTimestamp("data_inicio").toLocalDateTime() : null)
			.data_fim(rs.getTimestamp("data_fim") != null ? rs.getTimestamp("data_fim").toLocalDateTime() : null)			
			.cep(rs.getString("cep")).endereco(rs.getString("endereco"))
			.numero(rs.getInt("numero")).complemento(rs.getString("complemento")).bairro(rs.getString("bairro"))
			.cidade(rs.getString("cidade")).uf(rs.getString("uf")).telefone(rs.getString("telefone"))
			.celular(rs.getString("celular")).email(rs.getString("email")).contato(rs.getString("contato"))
			.infraestrutura(rs.getString("infraestrutura"))
			.build();

	/**
	 * Executa o metodo cadastrar.
	 * @param request valor do parametro request.
	 * @return resultado da operacao.
	 */
	public int cadastrar(CadastrarEmpresaRequest request) {
		KeyHolder keyHolder = new GeneratedKeyHolder();
		String sql = "INSERT INTO empresas(nome_fantasia, razao_social,cnpj, inscricao, data_inicio, data_fim, "
				+ " cep, endereco, numero, complemento, bairro, cidade, uf, telefone, celular, email, contato)"
				+ " values(:nome_fantasia, :razao_social, :cnpj, :inscricao, :data_inicio, :data_fim,"
				+ " :cep, :endereco, :numero, :complemento, :bairro, :cidade, :uf, :telefone, :celular, :email, :contato)";
		MapSqlParameterSource params = new MapSqlParameterSource()
				.addValue("nome_fantasia", request.getNome_fantasia())
				.addValue("razao_social", request.getRazao_social())				
				.addValue("cnpj", request.getCnpj()).addValue("inscricao", request.getInscricao())
				.addValue("data_inicio", request.getData_inicio()).addValue("data_fim", request.getData_fim())
				.addValue("cep", request.getCep()).addValue("endereco", request.getEndereco())
				.addValue("numero", request.getNumero()).addValue("complemento", request.getComplemento())
				.addValue("bairro", request.getBairro()).addValue("cidade", request.getCidade())
				.addValue("uf", request.getUf()).addValue("telefone", request.getTelefone())
				.addValue("celular", request.getCelular()).addValue("contato", request.getContato())
				.addValue("email", request.getEmail());
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
		String sqlList = "SELECT * FROM empresas ORDER BY nome_fantasia ASC LIMIT :limit OFFSET :offset";
		MapSqlParameterSource params = new MapSqlParameterSource().addValue("limit", limit).addValue("offset",
				(page - 1) * limit);

		try {
			List<EmpresaResponse> lista = namedParameterJdbcTemplate.query(sqlList, params, empresaMapper);

			String sqlCount = "SELECT COUNT(id) FROM empresas";
			Integer total = namedParameterJdbcTemplate.queryForObject(sqlCount, new MapSqlParameterSource(),
					Integer.class);

			Map<String, Object> resultado = new HashMap<>();
			resultado.put("lista", lista);
			resultado.put("total", total);

			return resultado;

		} catch (EmptyResultDataAccessException e) {
			throw new DefaultErrorException("Nenhuma empresa encontrada.", HttpStatus.NO_CONTENT);
		} catch (DataAccessException e) {			
			throw new DefaultErrorException("Erro ao consultar as empresas na base de dados.",
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Executa o metodo atualizar.
	 * @param request valor do parametro request.
	 */
	public void atualizar(AtualizarEmpresaRequest request) {
		String sql = "UPDATE empresas set nome_fantasia = :nome_fantasia, razao_social = :razao_social, cnpj = :cnpj, inscricao = :inscricao, data_inicio = :data_inicio, data_fim = :data_fim,"
				+ " cep = :cep, endereco = :endereco, numero = :numero, complemento = :complemento, bairro = :bairro, cidade = :cidade, uf = :uf,"
				+ " telefone = :telefone, celular = :celular, email = :email, contato = :contato WHERE id = :id";
		MapSqlParameterSource params = new MapSqlParameterSource()
				.addValue("nome_fantasia", request.getNome_fantasia())
				.addValue("razao_social", request.getRazao_social())
				.addValue("cnpj", request.getCnpj()).addValue("inscricao", request.getInscricao())
				.addValue("data_inicio", request.getData_inicio()).addValue("data_fim", request.getData_fim())
				.addValue("cep", request.getCep()).addValue("endereco", request.getEndereco())
				.addValue("numero", request.getNumero()).addValue("complemento", request.getComplemento())
				.addValue("bairro", request.getBairro()).addValue("cidade", request.getCidade())
				.addValue("uf", request.getUf()).addValue("telefone", request.getTelefone())
				.addValue("celular", request.getCelular()).addValue("contato", request.getContato())
				.addValue("email", request.getEmail())
				.addValue("id", request.getId());
		try {
			namedParameterJdbcTemplate.update(sql, params);
		} catch (DataAccessException e) {
			e.printStackTrace();
			throw new DefaultErrorException("Erro ao gravar os dados na base", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Executa o metodo buscarPorId.
	 * @param id valor do parametro id.
	 * @return resultado da operacao.
	 */
	public EmpresaResponse buscarPorId(int id) {
		String sql = "SELECT * FROM empresas WHERE id = :id";
		MapSqlParameterSource params = new MapSqlParameterSource().addValue("id", id);
		try {
			return namedParameterJdbcTemplate.<EmpresaResponse>queryForObject(sql, params, empresaMapper);

		} catch (EmptyResultDataAccessException e) {
			throw new DefaultErrorException("Nenhuma empresa encontrada.", HttpStatus.NO_CONTENT);
		} catch (DataAccessException e) {
			throw new DefaultErrorException("Erro ao consultar as empresas na base de dados.",
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Executa o metodo salvarInfraEstrutura.
	 * @param texto valor do parametro texto.
	 * @param id valor do parametro id.
	 */
	public void salvarInfraEstrutura(String texto, int id) {
		String sql = "UPDATE empresas set infraestrutura = :texto where id = :id";
		MapSqlParameterSource params = new MapSqlParameterSource().addValue("texto", texto).addValue("id", id);
		try {
			namedParameterJdbcTemplate.update(sql, params);
		} catch (DataAccessException e) {
			e.printStackTrace();
			throw new DefaultErrorException("Erro ao gravar os dados na base", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Executa o metodo listarPorPaginaENome.
	 * @param limit valor do parametro limit.
	 * @param page valor do parametro page.
	 * @param nome valor do parametro nome.
	 * @return resultado da operacao.
	 */
	public Map<String, Object> listarPorPaginaENome(int limit, int page, String nome) {
		String sqlList = """
				    SELECT * FROM empresas
				    /**
				     * Executa o metodo LOWER.
				     * @param LOWER(:nome_fantasia valor do parametro LOWER(:nome_fantasia.
				     * @return resultado da operacao.
				     */
				    WHERE LOWER(nome_fantasia) LIKE LOWER(:nome_fantasia)
				    ORDER BY nome_fantasia ASC
				    LIMIT :limit OFFSET :offset
				""";

		MapSqlParameterSource params = new MapSqlParameterSource().addValue("nome_fantasia", "%" + nome + "%")
				.addValue("limit", limit).addValue("offset", (page - 1) * limit);

		try {
			List<EmpresaResponse> lista = namedParameterJdbcTemplate.query(sqlList, params, empresaMapper);

			String sqlCount = """
					    /**
					     * Executa o metodo COUNT.
					     * @param LOWER(:nome_fantasia valor do parametro LOWER(:nome_fantasia.
					     * @return resultado da operacao.
					     */
					    SELECT COUNT(id)
					    FROM empresas
					    WHERE LOWER(nome_fantasia) LIKE LOWER(:nome_fantasia)
					""";

			MapSqlParameterSource countParams = new MapSqlParameterSource().addValue("nome_fantasia", nome + "%");

			Integer total = namedParameterJdbcTemplate.queryForObject(sqlCount, countParams, Integer.class);

			Map<String, Object> resultado = new HashMap<>();
			resultado.put("lista", lista);
			resultado.put("total", total);

			return resultado;

		} catch (EmptyResultDataAccessException e) {
			throw new DefaultErrorException("Nenhuma empresa encontrada.", HttpStatus.NO_CONTENT);
		} catch (DataAccessException e) {
			e.printStackTrace();
			throw new DefaultErrorException("Erro ao consultar as empresas na base de dados.",
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Executa o metodo excluir.
	 * @param id valor do parametro id.
	 */
	public void excluir(Integer id) {
		String sql = "DELETE FROM empresas WHERE id = :id";
		MapSqlParameterSource params = new MapSqlParameterSource().addValue("id", id);
		try {
			namedParameterJdbcTemplate.update(sql, params);
		} catch (DataAccessException e) {
			throw new DefaultErrorException("Erro ao excluir o dado na base", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

}

