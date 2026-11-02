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
import br.com.sistema_gerencial.models.requests.AtualizarManutencaoRequest;
import br.com.sistema_gerencial.models.requests.CadastrarManutencaoRequest;
import br.com.sistema_gerencial.models.response.ManutencaoResponse;
import lombok.RequiredArgsConstructor;

/**
 * Consulta e persiste os dados de ordens de manutenção por meio de SQL e JDBC.
 */
@Repository
@RequiredArgsConstructor
public class ManutencaoRepository {
	
	private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;
	
	final RowMapper<ManutencaoResponse> historicoMapper = (rs, rowNum) ->
    ManutencaoResponse.builder()
        .id(rs.getInt("id"))
        .id_equipamento(rs.getInt("id_equipamento"))
        .data_inicio(rs.getTimestamp("data_inicio") != null ? 
            rs.getTimestamp("data_inicio").toLocalDateTime() : null)
        .data_fim(rs.getTimestamp("data_fim") != null ? 
            rs.getTimestamp("data_fim").toLocalDateTime() : null)
        .tipo_atendimento(rs.getString("tipo_atendimento"))
        .tipo_servico(rs.getString("tipo_servico"))
        .valor_servico(rs.getDouble("valor_servico"))
        .descricao(rs.getString("descricao"))
        .observacoes(rs.getString("observacoes"))
        .executores(rs.getString("executores"))
        .status_atendimento(rs.getInt("status_atendimento"))
        .motivo_cancelamento(rs.getString("motivo_cancelamento"))
        .build();
    
    
	/**
	 * Executa o metodo cadastrar.
	 * @param request valor do parametro request.
	 * @return resultado da operacao.
	 */
	public int cadastrar(CadastrarManutencaoRequest request) {
		KeyHolder keyHolder = new GeneratedKeyHolder();
		String sql = "INSERT INTO manutencao(data_inicio, data_fim, tipo_atendimento, tipo_servico, valor_servico, descricao, observacoes, id_equipamento, executores) values(:data_inicio, :data_fim, :tipo_atendimento, :tipo_servico, :valor_servico, :descricao, :observacoes, :id_equipamento, :executores)";
		MapSqlParameterSource params = new MapSqlParameterSource()
				.addValue("data_inicio", request.getData_inicio())
				.addValue("data_fim", request.getData_fim())
				.addValue("tipo_atendimento", request.getTipo_atendimento())				
				.addValue("tipo_servico", request.getTipo_servico())
				.addValue("valor_servico", request.getValor_servico())
				.addValue("descricao", request.getDescricao())
				.addValue("observacoes", request.getObservacoes())
				.addValue("id_equipamento", request.getId_equipamento())
				.addValue("executores", request.getExecutores());
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
	 * @param id valor do parametro id.
	 * @return resultado da operacao.
	 */
	public Map<String, Object> listarPorPagina(Integer limit, Integer page, int id) {
		String sqlList = "SELECT * FROM manutencao WHERE id_equipamento = :id_equipamento ORDER BY id DESC LIMIT :limit OFFSET :offset";
		MapSqlParameterSource params = new MapSqlParameterSource()
				.addValue("id_equipamento", id)
				.addValue("limit", limit)
				.addValue("offset", (page - 1) * limit);

		try {
			
			System.out.printf("SQL: %s%n", sqlList);
			System.out.printf("Params: id=%d, limit=%d, offset=%d%n", id, limit, (page - 1) * limit);
			
			List<ManutencaoResponse> lista = namedParameterJdbcTemplate.query(sqlList, params, historicoMapper);

			String sqlCount = "SELECT COUNT(id_equipamento) FROM manutencao WHERE id_equipamento = :id_equipamento";
			params = new MapSqlParameterSource()
					.addValue("id_equipamento", id);
			Integer total = namedParameterJdbcTemplate.queryForObject(sqlCount, params, Integer.class);

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

	public Map<String, Object> listarPorEmpresa(Integer limit, Integer page, int idEmpresa) {
		String sqlList = """
				SELECT m.*
				FROM manutencao m
				INNER JOIN equipamentos e ON e.id = m.id_equipamento
				WHERE e.id_empresa = :id_empresa
				ORDER BY m.id DESC
				LIMIT :limit OFFSET :offset
				""";
		MapSqlParameterSource params = new MapSqlParameterSource()
				.addValue("id_empresa", idEmpresa)
				.addValue("limit", limit)
				.addValue("offset", (page - 1) * limit);

		try {
			List<ManutencaoResponse> lista = namedParameterJdbcTemplate.query(sqlList, params, historicoMapper);

			String sqlCount = """
					SELECT COUNT(m.id)
					FROM manutencao m
					INNER JOIN equipamentos e ON e.id = m.id_equipamento
					WHERE e.id_empresa = :id_empresa
					""";
			Integer total = namedParameterJdbcTemplate.queryForObject(sqlCount,
					new MapSqlParameterSource().addValue("id_empresa", idEmpresa), Integer.class);

			Map<String, Object> resultado = new HashMap<>();
			resultado.put("lista", lista);
			resultado.put("total", total);
			return resultado;
		} catch (EmptyResultDataAccessException e) {
			throw new DefaultErrorException("Nenhum historico encontrado.", HttpStatus.NO_CONTENT);
		} catch (DataAccessException e) {
			throw new DefaultErrorException("Erro ao consultar as manutencoes do cliente na base de dados.",
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
    
	/**
	 * Executa o metodo buscarPorId.
	 * @param id valor do parametro id.
	 * @return resultado da operacao.
	 */
	public ManutencaoResponse buscarPorId(int id) {
		String sql = "SELECT * FROM manutencao WHERE id = :id";
		MapSqlParameterSource params = new MapSqlParameterSource().addValue("id", id);
		try {
			return namedParameterJdbcTemplate.<ManutencaoResponse>queryForObject(sql, params, historicoMapper);

		} catch (EmptyResultDataAccessException e) {
			throw new DefaultErrorException("Nenhum histÃ³rico encontrado.", HttpStatus.NO_CONTENT);
		} catch (DataAccessException e) {
			throw new DefaultErrorException("Erro ao consultar o histÃ³rico na base de dados.",
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
    
	/**
	 * Executa o metodo atualizar.
	 * @param request valor do parametro request.
	 */
	public void atualizar(AtualizarManutencaoRequest request) {
		String sql = "UPDATE manutencao set id_equipamento = :id_equipamento, data_inicio = :data_inicio, data_fim = :data_fim, tipo_atendimento = :tipo_atendimento, tipo_servico = :tipo_servico, valor_servico = :valor_servico, descricao = :descricao, observacoes = :observacoes, executores = :executores WHERE id = :id";
		
		MapSqlParameterSource params = new MapSqlParameterSource()
				.addValue("id_equipamento", request.getId_equipamento())
				.addValue("data_inicio", request.getData_inicio())
				.addValue("data_fim", request.getData_fim())
				.addValue("tipo_atendimento", request.getTipo_atendimento())
				.addValue("tipo_servico", request.getTipo_servico())	
				.addValue("valor_servico", request.getValor_servico())
				.addValue("descricao", request.getDescricao())
				.addValue("observacoes", request.getObservacoes())
				.addValue("executores", request.getExecutores())
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
		String sql = "DELETE FROM manutencao WHERE id = :id";
		MapSqlParameterSource params = new MapSqlParameterSource().addValue("id", id);
		try {
			namedParameterJdbcTemplate.update(sql, params);
		} catch (DataAccessException e) {		
			e.printStackTrace();
			throw new DefaultErrorException("Erro ao excluir o dado na base", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}


	/**
	 * Executa o metodo alterarStatus.
	 * @param id valor do parametro id.
	 * @param status valor do parametro status.
	 * @param motivo_cancelamento valor do parametro motivo_cancelamento.
	 */
	public void alterarStatus(int id, int status, String motivo_cancelamento, String observacoes) {
		String sql = "UPDATE manutencao set status_atendimento = :status_atendimento, "
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
}

