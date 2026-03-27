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
import br.com.sistema_gerencial.models.requests.AtualizarAgendamentoRequest;
import br.com.sistema_gerencial.models.requests.CadastrarAgendamentoRequest;
import br.com.sistema_gerencial.models.response.AgendamentoResponse;
import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class AgendamentoRepository {

	private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;

	final RowMapper<AgendamentoResponse> agendamentoMapper = (rs, rowNum) -> AgendamentoResponse.builder()
			.id(rs.getInt("id"))
			.titulo(rs.getString("titulo"))
			.tipo_tarefa(rs.getString("tipo_tarefa"))
			.data_agendamento(rs.getTimestamp("data_agendamento") != null ? rs.getTimestamp("data_agendamento").toLocalDateTime() : null)
			.detalhes(rs.getString("detalhes"))
			.concluido(rs.getBoolean("concluido"))
			.build();

	public int cadastrar(CadastrarAgendamentoRequest request) {
		KeyHolder keyHolder = new GeneratedKeyHolder();
		String sql = "INSERT INTO agendamentos(titulo, tipo_tarefa, data_agendamento, detalhes, concluido) "
				+ "VALUES(:titulo, :tipo_tarefa, :data_agendamento, :detalhes, :concluido)";
		MapSqlParameterSource params = new MapSqlParameterSource()
				.addValue("titulo", request.getTitulo())
				.addValue("tipo_tarefa", request.getTipo_tarefa())
				.addValue("data_agendamento", request.getData_agendamento())
				.addValue("detalhes", request.getDetalhes())
				.addValue("concluido", request.isConcluido());
		try {
			namedParameterJdbcTemplate.update(sql, params, keyHolder, new String[] { "id" });
			return keyHolder.getKey().intValue();
		} catch (DataAccessException e) {
			e.printStackTrace();
			throw new DefaultErrorException("Erro ao gravar os dados do agendamento na base.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public Map<String, Object> listarPorPagina(Integer limit, Integer page) {
		String sqlList = "SELECT id, titulo, tipo_tarefa, data_agendamento, detalhes, concluido "
				+ "FROM agendamentos ORDER BY data_agendamento DESC, id DESC LIMIT :limit OFFSET :offset";
		MapSqlParameterSource params = new MapSqlParameterSource()
				.addValue("limit", limit)
				.addValue("offset", (page - 1) * limit);

		try {
			List<AgendamentoResponse> lista = namedParameterJdbcTemplate.query(sqlList, params, agendamentoMapper);
			String sqlCount = "SELECT COUNT(id) FROM agendamentos";
			Integer total = namedParameterJdbcTemplate.queryForObject(sqlCount, new MapSqlParameterSource(), Integer.class);

			Map<String, Object> resultado = new HashMap<>();
			resultado.put("lista", lista);
			resultado.put("total", total);
			return resultado;
		} catch (EmptyResultDataAccessException e) {
			throw new DefaultErrorException("Nenhum agendamento encontrado.", HttpStatus.NO_CONTENT);
		} catch (DataAccessException e) {
			e.printStackTrace();
			throw new DefaultErrorException("Erro ao consultar os agendamentos na base de dados.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public AgendamentoResponse buscarPorId(int id) {
		String sql = "SELECT id, titulo, tipo_tarefa, data_agendamento, detalhes, concluido FROM agendamentos WHERE id = :id";
		MapSqlParameterSource params = new MapSqlParameterSource().addValue("id", id);

		try {
			return namedParameterJdbcTemplate.queryForObject(sql, params, agendamentoMapper);
		} catch (EmptyResultDataAccessException e) {
			throw new DefaultErrorException("Agendamento nao encontrado.", HttpStatus.NOT_FOUND);
		} catch (DataAccessException e) {
			e.printStackTrace();
			throw new DefaultErrorException("Erro ao consultar o agendamento na base de dados.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public void atualizar(AtualizarAgendamentoRequest request) {
		String sql = "UPDATE agendamentos SET titulo = :titulo, tipo_tarefa = :tipo_tarefa, "
				+ "data_agendamento = :data_agendamento, detalhes = :detalhes, concluido = :concluido WHERE id = :id";
		MapSqlParameterSource params = new MapSqlParameterSource()
				.addValue("id", request.getId())
				.addValue("titulo", request.getTitulo())
				.addValue("tipo_tarefa", request.getTipo_tarefa())
				.addValue("data_agendamento", request.getData_agendamento())
				.addValue("detalhes", request.getDetalhes())
				.addValue("concluido", request.isConcluido());

		try {
			namedParameterJdbcTemplate.update(sql, params);
		} catch (DataAccessException e) {
			e.printStackTrace();
			throw new DefaultErrorException("Erro ao atualizar os dados do agendamento na base.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public void excluir(Integer id) {
		String sql = "DELETE FROM agendamentos WHERE id = :id";
		MapSqlParameterSource params = new MapSqlParameterSource().addValue("id", id);

		try {
			namedParameterJdbcTemplate.update(sql, params);
		} catch (DataAccessException e) {
			e.printStackTrace();
			throw new DefaultErrorException("Erro ao excluir o agendamento na base.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
