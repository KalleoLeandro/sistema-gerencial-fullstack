package br.com.sistema_gerencial.repositories;

import java.math.BigDecimal;
import java.sql.Timestamp;
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
import br.com.sistema_gerencial.models.requests.AtualizarServicoRequest;
import br.com.sistema_gerencial.models.requests.CadastrarServicoRequest;
import br.com.sistema_gerencial.models.response.ServicoResponse;
import lombok.RequiredArgsConstructor;

/**
 * Consulta e persiste os dados de serviços do catálogo por meio de SQL e JDBC.
 */
@Repository
@RequiredArgsConstructor
public class ServicoRepository {

	private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;

	private final RowMapper<ServicoResponse> servicoMapper = (rs, rowNum) -> ServicoResponse.builder()
			.id(rs.getInt("id"))
			.codigo(rs.getString("codigo"))
			.nome(rs.getString("nome"))
			.descricao(rs.getString("descricao"))
			.valor_padrao(rs.getBigDecimal("valor_padrao"))
			.ativo(rs.getBoolean("ativo"))
			.criado_em(toLocalDateTime(rs.getTimestamp("criado_em")))
			.atualizado_em(toLocalDateTime(rs.getTimestamp("atualizado_em")))
			.build();

	public int cadastrar(CadastrarServicoRequest request) {
		String sql = """
				INSERT INTO servicos (codigo, nome, descricao, valor_padrao, ativo)
				VALUES (:codigo, :nome, :descricao, :valorPadrao, :ativo)
				""";
		KeyHolder keyHolder = new GeneratedKeyHolder();

		try {
			namedParameterJdbcTemplate.update(sql, buildParams(request), keyHolder, new String[] { "id" });
			return keyHolder.getKey().intValue();
		} catch (DataAccessException exception) {
			exception.printStackTrace();
			throw new DefaultErrorException("Erro ao cadastrar o servico.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public Map<String, Object> listarPorPagina(int limit, int page) {
		String sql = """
				SELECT id, codigo, nome, descricao, valor_padrao, ativo, criado_em, atualizado_em
				FROM servicos
				ORDER BY nome ASC, id ASC
				LIMIT :limit OFFSET :offset
				""";
		MapSqlParameterSource params = new MapSqlParameterSource()
				.addValue("limit", limit)
				.addValue("offset", (page - 1) * limit);

		try {
			List<ServicoResponse> lista = namedParameterJdbcTemplate.query(sql, params, servicoMapper);
			Integer total = namedParameterJdbcTemplate.queryForObject(
					"SELECT COUNT(id) FROM servicos",
					new MapSqlParameterSource(),
					Integer.class);

			Map<String, Object> resultado = new HashMap<>();
			resultado.put("lista", lista);
			resultado.put("total", total);
			return resultado;
		} catch (DataAccessException exception) {
			exception.printStackTrace();
			throw new DefaultErrorException("Erro ao listar os servicos.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public List<ServicoResponse> listarAtivos() {
		String sql = """
				SELECT id, codigo, nome, descricao, valor_padrao, ativo, criado_em, atualizado_em
				FROM servicos
				WHERE ativo = TRUE
				ORDER BY nome ASC, id ASC
				""";

		try {
			return namedParameterJdbcTemplate.query(sql, new MapSqlParameterSource(), servicoMapper);
		} catch (DataAccessException exception) {
			exception.printStackTrace();
			throw new DefaultErrorException("Erro ao listar os servicos ativos.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public ServicoResponse buscarPorId(int id) {
		String sql = """
				SELECT id, codigo, nome, descricao, valor_padrao, ativo, criado_em, atualizado_em
				FROM servicos
				WHERE id = :id
				""";

		try {
			return namedParameterJdbcTemplate.queryForObject(sql, new MapSqlParameterSource("id", id), servicoMapper);
		} catch (EmptyResultDataAccessException exception) {
			throw new DefaultErrorException("Servico nao encontrado.", HttpStatus.NOT_FOUND);
		} catch (DataAccessException exception) {
			exception.printStackTrace();
			throw new DefaultErrorException("Erro ao buscar o servico.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public void atualizar(AtualizarServicoRequest request) {
		String sql = """
				UPDATE servicos
				SET codigo = :codigo,
				    nome = :nome,
				    descricao = :descricao,
				    valor_padrao = :valorPadrao,
				    ativo = :ativo
				WHERE id = :id
				""";
		MapSqlParameterSource params = buildParams(request).addValue("id", request.getId());

		try {
			namedParameterJdbcTemplate.update(sql, params);
		} catch (DataAccessException exception) {
			exception.printStackTrace();
			throw new DefaultErrorException("Erro ao atualizar o servico.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public void excluir(int id) {
		try {
			namedParameterJdbcTemplate.update(
					"DELETE FROM servicos WHERE id = :id",
					new MapSqlParameterSource("id", id));
		} catch (DataAccessException exception) {
			exception.printStackTrace();
			throw new DefaultErrorException("Erro ao excluir o servico.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	private MapSqlParameterSource buildParams(CadastrarServicoRequest request) {
		return buildParamsInterno(request.getCodigo(), request.getNome(), request.getDescricao(), request.getValor_padrao(),
				request.getAtivo());
	}

	private MapSqlParameterSource buildParams(AtualizarServicoRequest request) {
		return buildParamsInterno(request.getCodigo(), request.getNome(), request.getDescricao(), request.getValor_padrao(),
				request.getAtivo());
	}

	private MapSqlParameterSource buildParamsInterno(
			String codigo,
			String nome,
			String descricao,
			BigDecimal valorPadrao,
			Boolean ativo) {
		return new MapSqlParameterSource()
				.addValue("codigo", blankToNull(codigo))
				.addValue("nome", requiredName(nome))
				.addValue("descricao", blankToNull(descricao))
				.addValue("valorPadrao", monetary(valorPadrao))
				.addValue("ativo", ativo == null ? Boolean.TRUE : ativo);
	}

	private BigDecimal monetary(BigDecimal value) {
		return value == null ? BigDecimal.ZERO : value;
	}

	private String blankToNull(String value) {
		return value == null || value.trim().isEmpty() ? null : value.trim();
	}

	private String requiredName(String value) {
		String normalized = blankToNull(value);
		if (normalized == null) {
			throw new DefaultErrorException("Nome do servico e obrigatorio.", HttpStatus.BAD_REQUEST);
		}
		return normalized;
	}

	private java.time.LocalDateTime toLocalDateTime(Timestamp timestamp) {
		return timestamp == null ? null : timestamp.toLocalDateTime();
	}
}
