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
import br.com.sistema_gerencial.models.requests.AtualizarProdutoRequest;
import br.com.sistema_gerencial.models.requests.CadastrarProdutoRequest;
import br.com.sistema_gerencial.models.response.ProdutoResponse;
import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class ProdutoRepository {

	private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;

	private final RowMapper<ProdutoResponse> produtoMapper = (rs, rowNum) -> ProdutoResponse.builder()
			.id(rs.getInt("id"))
			.codigo(rs.getString("codigo"))
			.nome(rs.getString("nome"))
			.descricao(rs.getString("descricao"))
			.unidade_medida(rs.getString("unidade_medida"))
			.valor_custo(rs.getBigDecimal("valor_custo"))
			.valor_venda(rs.getBigDecimal("valor_venda"))
			.estoque_atual(rs.getBigDecimal("estoque_atual"))
			.estoque_minimo(rs.getBigDecimal("estoque_minimo"))
			.ativo(rs.getBoolean("ativo"))
			.criado_em(toLocalDateTime(rs.getTimestamp("criado_em")))
			.atualizado_em(toLocalDateTime(rs.getTimestamp("atualizado_em")))
			.build();

	public int cadastrar(CadastrarProdutoRequest request) {
		String sql = """
				INSERT INTO produtos (
				    codigo, nome, descricao, unidade_medida, valor_custo, valor_venda,
				    estoque_atual, estoque_minimo, ativo
				) VALUES (
				    :codigo, :nome, :descricao, :unidadeMedida, :valorCusto, :valorVenda,
				    :estoqueAtual, :estoqueMinimo, :ativo
				)
				""";
		KeyHolder keyHolder = new GeneratedKeyHolder();

		try {
			namedParameterJdbcTemplate.update(sql, buildParams(request), keyHolder, new String[] { "id" });
			return keyHolder.getKey().intValue();
		} catch (DataAccessException exception) {
			exception.printStackTrace();
			throw new DefaultErrorException("Erro ao cadastrar o produto.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public Map<String, Object> listarPorPagina(int limit, int page) {
		String sql = """
				SELECT id, codigo, nome, descricao, unidade_medida, valor_custo, valor_venda,
				       estoque_atual, estoque_minimo, ativo, criado_em, atualizado_em
				FROM produtos
				ORDER BY nome ASC, id ASC
				LIMIT :limit OFFSET :offset
				""";
		MapSqlParameterSource params = new MapSqlParameterSource()
				.addValue("limit", limit)
				.addValue("offset", (page - 1) * limit);

		try {
			List<ProdutoResponse> lista = namedParameterJdbcTemplate.query(sql, params, produtoMapper);
			Integer total = namedParameterJdbcTemplate.queryForObject(
					"SELECT COUNT(id) FROM produtos",
					new MapSqlParameterSource(),
					Integer.class);

			Map<String, Object> resultado = new HashMap<>();
			resultado.put("lista", lista);
			resultado.put("total", total);
			return resultado;
		} catch (DataAccessException exception) {
			exception.printStackTrace();
			throw new DefaultErrorException("Erro ao listar os produtos.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public List<ProdutoResponse> listarAtivos() {
		String sql = """
				SELECT id, codigo, nome, descricao, unidade_medida, valor_custo, valor_venda,
				       estoque_atual, estoque_minimo, ativo, criado_em, atualizado_em
				FROM produtos
				WHERE ativo = TRUE
				ORDER BY nome ASC, id ASC
				""";

		try {
			return namedParameterJdbcTemplate.query(sql, new MapSqlParameterSource(), produtoMapper);
		} catch (DataAccessException exception) {
			exception.printStackTrace();
			throw new DefaultErrorException("Erro ao listar os produtos ativos.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public List<ProdutoResponse> listarEmFalta() {
		String sql = """
				SELECT id, codigo, nome, descricao, unidade_medida, valor_custo, valor_venda,
				       estoque_atual, estoque_minimo, ativo, criado_em, atualizado_em
				FROM produtos
				WHERE ativo = TRUE
				  AND estoque_atual < estoque_minimo
				ORDER BY (estoque_minimo - estoque_atual) DESC, nome ASC, id ASC
				""";

		try {
			return namedParameterJdbcTemplate.query(sql, new MapSqlParameterSource(), produtoMapper);
		} catch (DataAccessException exception) {
			exception.printStackTrace();
			throw new DefaultErrorException("Erro ao listar os produtos em falta.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public ProdutoResponse buscarPorId(int id) {
		String sql = """
				SELECT id, codigo, nome, descricao, unidade_medida, valor_custo, valor_venda,
				       estoque_atual, estoque_minimo, ativo, criado_em, atualizado_em
				FROM produtos
				WHERE id = :id
				""";

		try {
			return namedParameterJdbcTemplate.queryForObject(sql, new MapSqlParameterSource("id", id), produtoMapper);
		} catch (EmptyResultDataAccessException exception) {
			throw new DefaultErrorException("Produto nao encontrado.", HttpStatus.NOT_FOUND);
		} catch (DataAccessException exception) {
			exception.printStackTrace();
			throw new DefaultErrorException("Erro ao buscar o produto.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public void atualizar(AtualizarProdutoRequest request) {
		String sql = """
				UPDATE produtos
				SET codigo = :codigo,
				    nome = :nome,
				    descricao = :descricao,
				    unidade_medida = :unidadeMedida,
				    valor_custo = :valorCusto,
				    valor_venda = :valorVenda,
				    estoque_atual = :estoqueAtual,
				    estoque_minimo = :estoqueMinimo,
				    ativo = :ativo
				WHERE id = :id
				""";

		MapSqlParameterSource params = buildParams(request).addValue("id", request.getId());

		try {
			namedParameterJdbcTemplate.update(sql, params);
		} catch (DataAccessException exception) {
			exception.printStackTrace();
			throw new DefaultErrorException("Erro ao atualizar o produto.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public void excluir(int id) {
		try {
			namedParameterJdbcTemplate.update(
					"DELETE FROM produtos WHERE id = :id",
					new MapSqlParameterSource("id", id));
		} catch (DataAccessException exception) {
			exception.printStackTrace();
			throw new DefaultErrorException("Erro ao excluir o produto.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	private MapSqlParameterSource buildParams(CadastrarProdutoRequest request) {
		return buildParamsInterno(request.getCodigo(), request.getNome(), request.getDescricao(), request.getUnidade_medida(),
				request.getValor_custo(), request.getValor_venda(), request.getEstoque_atual(), request.getEstoque_minimo(),
				request.getAtivo());
	}

	private MapSqlParameterSource buildParams(AtualizarProdutoRequest request) {
		return buildParamsInterno(request.getCodigo(), request.getNome(), request.getDescricao(), request.getUnidade_medida(),
				request.getValor_custo(), request.getValor_venda(), request.getEstoque_atual(), request.getEstoque_minimo(),
				request.getAtivo());
	}

	private MapSqlParameterSource buildParamsInterno(
			String codigo,
			String nome,
			String descricao,
			String unidadeMedida,
			BigDecimal valorCusto,
			BigDecimal valorVenda,
			BigDecimal estoqueAtual,
			BigDecimal estoqueMinimo,
			Boolean ativo) {
		return new MapSqlParameterSource()
				.addValue("codigo", blankToNull(codigo))
				.addValue("nome", requiredName(nome))
				.addValue("descricao", blankToNull(descricao))
				.addValue("unidadeMedida", blankToDefault(unidadeMedida, "UN"))
				.addValue("valorCusto", monetary(valorCusto))
				.addValue("valorVenda", monetary(valorVenda))
				.addValue("estoqueAtual", quantity(estoqueAtual))
				.addValue("estoqueMinimo", quantity(estoqueMinimo))
				.addValue("ativo", ativo == null ? Boolean.TRUE : ativo);
	}

	private BigDecimal monetary(BigDecimal value) {
		return value == null ? BigDecimal.ZERO : value;
	}

	private BigDecimal quantity(BigDecimal value) {
		return value == null ? BigDecimal.ZERO : value;
	}

	private String blankToNull(String value) {
		return value == null || value.trim().isEmpty() ? null : value.trim();
	}

	private String blankToDefault(String value, String defaultValue) {
		String normalized = blankToNull(value);
		return normalized == null ? defaultValue : normalized;
	}

	private String requiredName(String value) {
		String normalized = blankToNull(value);
		if (normalized == null) {
			throw new DefaultErrorException("Nome do produto e obrigatorio.", HttpStatus.BAD_REQUEST);
		}
		return normalized;
	}

	private java.time.LocalDateTime toLocalDateTime(Timestamp timestamp) {
		return timestamp == null ? null : timestamp.toLocalDateTime();
	}
}
