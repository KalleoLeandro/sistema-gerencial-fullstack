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
import br.com.sistema_gerencial.models.requests.AtualizarAtendimentoRequest;
import br.com.sistema_gerencial.models.requests.CadastrarAtendimentoRequest;
import br.com.sistema_gerencial.models.response.AtendimentoResponse;
import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class AtendimentoRepository {
	
	private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;
	
	final RowMapper<AtendimentoResponse> historicoMapper = (rs, rowNum) ->
	AtendimentoResponse.builder()
        .id(rs.getInt("id"))
        .id_empresa(rs.getInt("id_empresa"))
        .data_inicio(rs.getTimestamp("data_inicio") != null ? 
            rs.getTimestamp("data_inicio").toLocalDateTime() : null)
        .data_fim(rs.getTimestamp("data_fim") != null ? 
            rs.getTimestamp("data_fim").toLocalDateTime() : null)
        .solicitante(rs.getString("solicitante"))
        .tipo_atendimento(rs.getString("tipo_atendimento"))
        .executores(rs.getString("executores"))
        .valor_servico(rs.getDouble("valor_servico"))
        .descricao(rs.getString("descricao"))
        .observacoes(rs.getString("observacoes"))
        .status_atendimento(rs.getInt("status_atendimento"))
        .motivo_cancelamento(rs.getString("motivo_cancelamento"))
        .build();
	
	final RowMapper<AtendimentoResponse> historicoMapperPorId = (rs, rowNum) ->
	AtendimentoResponse.builder()
        .id(rs.getInt("id"))
        .id_empresa(rs.getInt("id_empresa"))
        .data_inicio(rs.getTimestamp("data_inicio") != null ? 
            rs.getTimestamp("data_inicio").toLocalDateTime() : null)
        .data_fim(rs.getTimestamp("data_fim") != null ? 
            rs.getTimestamp("data_fim").toLocalDateTime() : null)
        .solicitante(rs.getString("solicitante"))
        .executores(rs.getString("executores"))
        .observacoes(rs.getString("observacoes"))
        .status_atendimento(rs.getInt("status_atendimento"))
        .build();

	
	/**
	 * Executa o metodo cadastrarAtendimento.
	 * @param request valor do parametro request.
	 * @return resultado da operacao.
	 */
	public int cadastrarAtendimento(CadastrarAtendimentoRequest request) {
		KeyHolder keyHolder = new GeneratedKeyHolder();
		String sql = "INSERT INTO atendimentos (data_inicio, data_fim, solicitante, tipo_atendimento, executores, valor_servico, descricao, observacoes, id_empresa) values(:data_inicio, :data_fim, :solicitante, :tipo_atendimento, :executores, :valor_servico, :descricao, :observacoes, :id_empresa)";
		MapSqlParameterSource params = new MapSqlParameterSource()
				.addValue("data_inicio", request.getData_inicio())
				.addValue("data_fim", request.getData_fim())
				.addValue("solicitante", request.getSolicitante())
				.addValue("tipo_atendimento", request.getTipo_atendimento())
				.addValue("executores", request.getExecutores())
				.addValue("valor_servico", request.getValor_servico())
				.addValue("descricao", request.getDescricao())
				.addValue("observacoes", request.getObservacoes())
				.addValue("id_empresa", request.getId_empresa());
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
		String sqlList = "SELECT atendimentos.id as id, atendimentos.id_empresa as id_empresa, atendimentos.data_inicio as data_inicio,"
				+ " atendimentos.data_fim as data_fim, atendimentos.solicitante as solicitante, "
				+ "atendimentos.executores as executores, atendimentos.observacoes as observacoes, atendimentos.status_atendimento as status_atendimento "
				+ "FROM atendimentos "
				+ "WHERE id_empresa = :id_empresa ORDER BY atendimentos.id DESC LIMIT :limit OFFSET :offset";
		MapSqlParameterSource params = new MapSqlParameterSource()
				.addValue("id_empresa", id)
				.addValue("limit", limit)
				.addValue("offset", (page - 1) * limit);

		try {	
			
			List<AtendimentoResponse> lista = namedParameterJdbcTemplate.query(sqlList, params, historicoMapperPorId);

			String sqlCount = "SELECT COUNT(id_empresa) FROM atendimentos WHERE id_empresa = :id_empresa";
			params = new MapSqlParameterSource()
					.addValue("id_empresa", id);
			Integer total = namedParameterJdbcTemplate.queryForObject(sqlCount, params, Integer.class);

			Map<String, Object> resultado = new HashMap<>();
			resultado.put("lista", lista);
			resultado.put("total", total);

			return resultado;

		} catch (EmptyResultDataAccessException e) {
			throw new DefaultErrorException("Nenhum histÃ³rico encontrado.", HttpStatus.NO_CONTENT);
		} catch (DataAccessException e) {
			e.printStackTrace();
			throw new DefaultErrorException("Erro ao consultar o histÃ³rico de atendimentoss na base de dados.",
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	
	/**
	 * Executa o metodo buscarPorId.
	 * @param id valor do parametro id.
	 * @return resultado da operacao.
	 */
	public AtendimentoResponse buscarPorId(int id) {
		String sql = "SELECT atendimentos.id as id, atendimentos.id_empresa as id_empresa, atendimentos.data_inicio as data_inicio,"
				+ " atendimentos.data_fim as data_fim, atendimentos.solicitante as solicitante, atendimentos.tipo_atendimento as tipo_atendimento, atendimentos.executores as executores,"
				+ " atendimentos.valor_servico as valor_servico, atendimentos.descricao as descricao, atendimentos.observacoes as observacoes, atendimentos.status_atendimento as status_atendimento, atendimentos.motivo_cancelamento as motivo_cancelamento "				
				+ "FROM atendimentos WHERE atendimentos.id = :id";
		MapSqlParameterSource params = new MapSqlParameterSource().addValue("id", id);
		try {
			return namedParameterJdbcTemplate.<AtendimentoResponse>queryForObject(sql, params, historicoMapper);

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
	public void atualizar(AtualizarAtendimentoRequest request) {
		String sql = "UPDATE atendimentos set id_empresa = :id_empresa, data_inicio = :data_inicio, data_fim = :data_fim, solicitante = :solicitante, tipo_atendimento = :tipo_atendimento, executores = :executores, valor_servico = :valor_servico, descricao = :descricao, observacoes = :observacoes WHERE id = :id";
		
		MapSqlParameterSource params = new MapSqlParameterSource().addValue("id_empresa", request.getId_empresa())
				.addValue("id_empresa", request.getId_empresa())
				.addValue("data_inicio", request.getData_inicio())
				.addValue("data_fim", request.getData_fim())
				.addValue("solicitante", request.getSolicitante())
				.addValue("tipo_atendimento", request.getTipo_atendimento())
				.addValue("executores", request.getExecutores())
				.addValue("valor_servico", request.getValor_servico())
				.addValue("descricao", request.getDescricao())
				.addValue("observacoes", request.getObservacoes())
				.addValue("id", request.getId());
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
		String sql = "UPDATE atendimentos set status_atendimento = :status_atendimento, "
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
		String sql = "DELETE FROM atendimentos WHERE id = :id";
		MapSqlParameterSource params = new MapSqlParameterSource().addValue("id", id);
		try {
			namedParameterJdbcTemplate.update(sql, params);
		} catch (DataAccessException e) {		
			e.printStackTrace();
			throw new DefaultErrorException("Erro ao excluir o dado na base", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}

