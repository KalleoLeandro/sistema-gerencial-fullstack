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
import br.com.sistema_gerencial.models.requests.AtualizarAvulsoRequest;
import br.com.sistema_gerencial.models.requests.CadastrarAvulsoRequest;
import br.com.sistema_gerencial.models.response.AvulsoResponse;
import lombok.RequiredArgsConstructor;

/**
 * Consulta e persiste os dados de serviços avulsos por meio de SQL e JDBC.
 */
@Repository
@RequiredArgsConstructor
public class AvulsoRepository {

	private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;

	final RowMapper<AvulsoResponse> historicoMapperPorId = (rs, rowNum) -> AvulsoResponse.builder().id(rs.getInt("id"))
			.nome_cliente(rs.getString("nome_cliente"))
			.cpf_cnpj(rs.getString("cpf_cnpj")).ie(rs.getString("ie"))
			.razao_social(rs.getString("razao_social"))
			.data_inicio(
					rs.getTimestamp("data_inicio") != null ? rs.getTimestamp("data_inicio").toLocalDateTime() : null)
			.data_fim(rs.getTimestamp("data_fim") != null ? rs.getTimestamp("data_fim").toLocalDateTime() : null)
			.tipo_pessoa(rs.getString("tipo_pessoa"))
			.tipo_atendimento(rs.getString("tipo_atendimento"))
			.executores(rs.getString("executores"))
			.valor_servico(rs.getDouble("valor_servico")).cep(rs.getString("cep")).endereco(rs.getString("endereco"))
			.numero(rs.getInt("numero")).complemento(rs.getString("complemento")).bairro(rs.getString("bairro"))
			.cidade(rs.getString("cidade")).uf(rs.getString("uf")).telefone(rs.getString("telefone"))
			.celular(rs.getString("celular")).email(rs.getString("email")).contato(rs.getString("contato"))
			.status_atendimento(rs.getInt("status_atendimento"))
			.motivo_cancelamento(rs.getString("motivo_cancelamento"))
			.descricao(rs.getString("descricao"))
			.observacoes(rs.getString("observacoes"))
			.deslocamento(rs.getInt("deslocamento"))
			.valor_deslocamento(rs.getDouble("valor_deslocamento"))
			.total(rs.getDouble("total"))
			.build();

	final RowMapper<AvulsoResponse> historicoMapper = (rs, rowNum) -> AvulsoResponse.builder().id(rs.getInt("id"))
			.nome_cliente(rs.getString("nome_cliente"))
			.cpf_cnpj(rs.getString("cpf_cnpj"))
			.data_inicio(
					rs.getTimestamp("data_inicio") != null ? rs.getTimestamp("data_inicio").toLocalDateTime() : null)
			.data_fim(rs.getTimestamp("data_fim") != null ? rs.getTimestamp("data_fim").toLocalDateTime() : null)
			.executores(rs.getString("executores")).valor_servico(rs.getDouble("valor_servico"))
			.status_atendimento(rs.getInt("status_atendimento"))
			.build();

	/**
	 * Executa o metodo cadastrar.
	 * @param request valor do parametro request.
	 * @return resultado da operacao.
	 */
	public int cadastrar(CadastrarAvulsoRequest request) {
		KeyHolder keyHolder = new GeneratedKeyHolder();
		String sql = "INSERT INTO avulsos(nome_cliente, tipo_pessoa, cpf_cnpj, ie, razao_social, data_inicio, data_fim, tipo_atendimento, executores, descricao, valor_servico, "
				+ "cep, endereco, numero, complemento, bairro, cidade, uf, telefone, celular, email, contato, deslocamento, valor_deslocamento, total, observacoes) "
				+ "values(:nome_cliente, :tipo_pessoa, :cpf_cnpj, :ie, :razao_social, :data_inicio, :data_fim, :tipo_atendimento, :executores, :descricao, :valor_servico, "
				+ ":cep, :endereco, :numero, :complemento, :bairro, :cidade, :uf, :telefone, :celular, :email, :contato, :deslocamento, :valor_deslocamento, :total, :observacoes)";
		MapSqlParameterSource params = new MapSqlParameterSource().addValue("nome_cliente", request.getNome_cliente())
				.addValue("tipo_pessoa", request.getTipo_pessoa()).addValue("cpf_cnpj", request.getCpf_cnpj())
				.addValue("ie", request.getIe()).addValue("razao_social", request.getRazao_social())
				.addValue("data_inicio", request.getData_inicio()).addValue("data_fim", request.getData_fim())
				.addValue("tipo_atendimento", request.getTipo_atendimento())
				.addValue("executores", request.getExecutores()).addValue("descricao", request.getDescricao())
				.addValue("valor_servico", request.getValor_servico()).addValue("cep", request.getCep())
				.addValue("endereco", request.getEndereco()).addValue("numero", request.getNumero())
				.addValue("complemento", request.getComplemento()).addValue("bairro", request.getBairro())
				.addValue("cidade", request.getCidade()).addValue("uf", request.getUf())
				.addValue("telefone", request.getTelefone()).addValue("celular", request.getCelular())
				.addValue("contato", request.getContato()).addValue("email", request.getEmail())
				.addValue("deslocamento", request.getDeslocamento()).addValue("valor_deslocamento", request.getValor_deslocamento())
				.addValue("total", request.getTotal()).addValue("observacoes", request.getObservacoes());
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
		String sqlList = "SELECT avulsos.id as id, avulsos.nome_cliente as nome_cliente, avulsos.cpf_cnpj as cpf_cnpj, avulsos.executores, "
				+ " avulsos.data_inicio as data_inicio, avulsos.data_fim as data_fim, "
				+ " avulsos.valor_servico as valor_servico, avulsos.status_atendimento as status_atendimento "
				+ "FROM avulsos "
				+ "ORDER BY avulsos.id DESC LIMIT :limit OFFSET :offset";
		MapSqlParameterSource params = new MapSqlParameterSource().addValue("limit", limit).addValue("offset",
				(page - 1) * limit);

		try {
			List<AvulsoResponse> lista = namedParameterJdbcTemplate.query(sqlList, params, historicoMapper);

			String sqlCount = "SELECT COUNT(id) FROM avulsos";
			Integer total = namedParameterJdbcTemplate.queryForObject(sqlCount, new MapSqlParameterSource(),
					Integer.class);

			Map<String, Object> resultado = new HashMap<>();
			resultado.put("lista", lista);
			resultado.put("total", total);

			return resultado;

		} catch (EmptyResultDataAccessException e) {
			e.printStackTrace();
			throw new DefaultErrorException("Nenhum atendimento avulso encontrada.", HttpStatus.NO_CONTENT);
		} catch (DataAccessException e) {
			e.printStackTrace();
			throw new DefaultErrorException("Erro ao consultar os atendimentos avulsos na base de dados.",
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Executa o metodo listarPorAtributoEPagina.
	 * @param limit valor do parametro limit.
	 * @param page valor do parametro page.
	 * @param pesquisa valor do parametro pesquisa.
	 * @param tipoConsulta valor do parametro tipoConsulta.
	 * @return resultado da operacao.
	 */
	public Map<String, Object> listarPorAtributoEPagina(Integer limit, Integer page, String pesquisa, String tipoConsulta) {
		String whereClause = montarWherePesquisa(tipoConsulta);
		String sqlBase = " FROM avulsos WHERE 1=1 AND " + whereClause;
		String sqlList = "SELECT avulsos.id as id, avulsos.nome_cliente as nome_cliente, avulsos.cpf_cnpj as cpf_cnpj,"
				+ " avulsos.data_inicio as data_inicio, avulsos.data_fim as data_fim, "
				+ " avulsos.valor_servico as valor_servico, avulsos.executores, avulsos.status_atendimento as status_atendimento "
				+ sqlBase
				+ " ORDER BY avulsos.id DESC LIMIT :limit OFFSET :offset";
		MapSqlParameterSource params = new MapSqlParameterSource()
				.addValue("limit", limit)
				.addValue("offset", (page - 1) * limit)
				.addValue("pesquisa", pesquisa)
				.addValue("executorRegex", montarRegexExecutor(tipoConsulta, pesquisa));

		try {
			List<AvulsoResponse> lista = namedParameterJdbcTemplate.query(sqlList, params, historicoMapper);

			String sqlCount = "SELECT COUNT(id)" + sqlBase;
			Integer total = namedParameterJdbcTemplate.queryForObject(sqlCount, params,
					Integer.class);

			Map<String, Object> resultado = new HashMap<>();
			resultado.put("lista", lista);
			resultado.put("total", total);

			return resultado;

		} catch (EmptyResultDataAccessException e) {
			e.printStackTrace();
			throw new DefaultErrorException("Nenhum atendimento avulso encontrada.", HttpStatus.NO_CONTENT);
		} catch (DataAccessException e) {
			e.printStackTrace();
			throw new DefaultErrorException("Erro ao consultar os atendimentos avulsos na base de dados.",
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Executa o metodo montarWherePesquisa.
	 * @param tipoConsulta valor do parametro tipoConsulta.
	 * @return resultado da operacao.
	 */
	private String montarWherePesquisa(String tipoConsulta) {
		if ("cpf".equalsIgnoreCase(tipoConsulta) || "cnpj".equalsIgnoreCase(tipoConsulta)) {
			return "cpf_cnpj LIKE CONCAT('%', :pesquisa, '%')";
		}
		if ("data_inicio".equalsIgnoreCase(tipoConsulta)) {
			return "DATE_FORMAT(data_inicio,'%d/%m/%Y') LIKE CONCAT('%', :pesquisa, '%')";
		}
		if ("executor_interno".equalsIgnoreCase(tipoConsulta) || "executor_externo".equalsIgnoreCase(tipoConsulta)) {
			return "executores REGEXP :executorRegex";
		}
		return "nome_cliente LIKE CONCAT('%', :pesquisa, '%')";
	}

	/**
	 * Executa o metodo montarRegexExecutor.
	 * @param tipoConsulta valor do parametro tipoConsulta.
	 * @param pesquisa valor do parametro pesquisa.
	 * @return resultado da operacao.
	 */
	private String montarRegexExecutor(String tipoConsulta, String pesquisa) {
		if (!"executor_interno".equalsIgnoreCase(tipoConsulta) && !"executor_externo".equalsIgnoreCase(tipoConsulta)) {
			return "";
		}

		String nomeEscapado = escaparRegexMysql(pesquisa == null ? "" : pesquisa);
		if ("executor_externo".equalsIgnoreCase(tipoConsulta)) {
			return "\"id\":0,\"nome\":\"[^\"]*" + nomeEscapado + "[^\"]*";
		}

		return "\"id\":[1-9][0-9]*,\"nome\":\"[^\"]*" + nomeEscapado + "[^\"]*";
	}

	/**
	 * Executa o metodo escaparRegexMysql.
	 * @param valor valor do parametro valor.
	 * @return resultado da operacao.
	 */
	private String escaparRegexMysql(String valor) {
		return valor
				.replace("\\", "\\\\")
				.replace(".", "\\.")
				.replace("*", "\\*")
				.replace("+", "\\+")
				.replace("?", "\\?")
				.replace("^", "\\^")
				.replace("$", "\\$")
				.replace("[", "\\[")
				.replace("]", "\\]")
				.replace("(", "\\(")
				.replace(")", "\\)")
				.replace("{", "\\{")
				.replace("}", "\\}")
				.replace("|", "\\|");
	}

	/**
	 * Executa o metodo buscarPorId.
	 * @param id valor do parametro id.
	 * @return resultado da operacao.
	 */
	public AvulsoResponse buscarPorId(int id) {
		String sql = "SELECT avulsos.id as id, avulsos.nome_cliente as nome_cliente, avulsos.tipo_pessoa as tipo_pessoa, avulsos.cpf_cnpj as cpf_cnpj,"
				+ " avulsos.ie as ie, avulsos.razao_social as razao_social,avulsos.data_inicio as data_inicio, avulsos.data_fim as data_fim, avulsos.tipo_atendimento as tipo_atendimento, avulsos.executores as executores,"
				+ " avulsos.descricao as descricao,avulsos.observacoes as observacoes,avulsos.valor_servico as valor_servico, avulsos.cep as cep, avulsos.endereco as endereco, avulsos. numero as numero, avulsos.complemento as complemento,"
				+ " avulsos.bairro as bairro, avulsos.cidade as cidade, avulsos.uf as uf, avulsos.telefone as telefone, avulsos.celular as celular, avulsos.email as email, avulsos.status_atendimento as status_atendimento,"
				+ "avulsos.motivo_cancelamento as motivo_cancelamento, avulsos.contato as contato, avulsos.deslocamento as deslocamento, avulsos.valor_deslocamento as valor_deslocamento, avulsos.total as total "
				+ "FROM avulsos WHERE avulsos.id = :id";
		MapSqlParameterSource params = new MapSqlParameterSource().addValue("id", id);
		try {
			return namedParameterJdbcTemplate.<AvulsoResponse>queryForObject(sql, params, historicoMapperPorId);

		} catch (EmptyResultDataAccessException e) {
			throw new DefaultErrorException("Nenhum histÃ³rico encontrado.", HttpStatus.NO_CONTENT);
		} catch (DataAccessException e) {
			e.printStackTrace();
			throw new DefaultErrorException("Erro ao consultar o histÃ³rico na base de dados.",
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Executa o metodo atualizar.
	 * @param request valor do parametro request.
	 */
	public void atualizar(AtualizarAvulsoRequest request) {
		String sql = "UPDATE avulsos set nome_cliente = :nome_cliente, tipo_pessoa = :tipo_pessoa, cpf_cnpj = :cpf_cnpj, ie = :ie, razao_social = :razao_social, data_inicio = :data_inicio, data_fim = :data_fim,"
				+ " tipo_atendimento = :tipo_atendimento, executores = :executores, descricao = :descricao, observacoes = :observacoes, valor_servico = :valor_servico, cep = :cep, endereco = :endereco, numero = :numero, complemento = :complemento,"
				+ " bairro = :bairro,cidade = :cidade, uf = :uf, telefone = :telefone, celular = :celular, email = :email, contato = :contato,"
				+ " deslocamento = :deslocamento, valor_deslocamento = :valor_deslocamento, total = :total WHERE id = :id";
		MapSqlParameterSource params = new MapSqlParameterSource().addValue("nome_cliente", request.getNome_cliente())
				.addValue("tipo_pessoa", request.getTipo_pessoa()).addValue("cpf_cnpj", request.getCpf_cnpj())
				.addValue("ie", request.getIe()).addValue("data_inicio", request.getData_inicio())
				.addValue("razao_social", request.getRazao_social())
				.addValue("data_fim", request.getData_fim()).addValue("tipo_atendimento", request.getTipo_atendimento())
				.addValue("executores", request.getExecutores()).addValue("descricao", request.getDescricao())
				.addValue("observacoes", request.getObservacoes())
				.addValue("valor_servico", request.getValor_servico()).addValue("cep", request.getCep())
				.addValue("endereco", request.getEndereco()).addValue("numero", request.getNumero())
				.addValue("complemento", request.getComplemento()).addValue("bairro", request.getBairro())
				.addValue("cidade", request.getCidade()).addValue("uf", request.getUf())
				.addValue("telefone", request.getTelefone()).addValue("celular", request.getCelular())
				.addValue("email", request.getEmail()).addValue("contato", request.getContato())
				.addValue("deslocamento", request.getDeslocamento()).addValue("valor_deslocamento", request.getValor_deslocamento())
				.addValue("total", request.getTotal()).addValue("id", request.getId());
		try {
			namedParameterJdbcTemplate.update(sql, params);
		} catch (DataAccessException e) {
			e.printStackTrace();
			throw new DefaultErrorException("Erro ao gravar os dados na base", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	/**
	 * Executa o metodo alterarStatus.
	 * @param id valor do parametro id.
	 * @param status valor do parametro status.
	 * @param motivo_cancelamento valor do parametro motivo_cancelamento.
	 */
	public void alterarStatus(int id, int status, String motivo_cancelamento, String observacoes) {
		String sql = "UPDATE avulsos set status_atendimento = :status_atendimento, "
				+ " motivo_cancelamento = :motivo_cancelamento, observacoes = :observacoes"
				+ " WHERE id = :id";
		MapSqlParameterSource params = new MapSqlParameterSource()
				.addValue("status_atendimento", status)
				.addValue("motivo_cancelamento", motivo_cancelamento)
				.addValue("observacoes", observacoes)
				.addValue("id", id);
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
		String sql = "DELETE FROM avulsos WHERE id = :id";
		MapSqlParameterSource params = new MapSqlParameterSource().addValue("id", id);
		try {
			namedParameterJdbcTemplate.update(sql, params);
		} catch (DataAccessException e) {
			e.printStackTrace();
			throw new DefaultErrorException("Erro ao excluir o dado na base", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

}

