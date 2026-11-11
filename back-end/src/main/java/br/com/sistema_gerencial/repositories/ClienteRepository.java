package br.com.sistema_gerencial.repositories;

import java.util.List;

import org.springframework.dao.DataAccessException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import br.com.sistema_gerencial.exceptions.DefaultErrorException;
import br.com.sistema_gerencial.models.response.ClienteResponse;
import lombok.RequiredArgsConstructor;

/**
 * Consulta e persiste os dados de clientes por meio de SQL e JDBC.
 */
@Repository
@RequiredArgsConstructor
public class ClienteRepository {

	private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;

	private final RowMapper<ClienteResponse> clienteMapper = (rs, rowNum) -> ClienteResponse.builder()
			.id(rs.getInt("id"))
			.nome(rs.getString("nome"))
			.documento(rs.getString("documento"))
			.cep(rs.getString("cep"))
			.endereco(rs.getString("endereco"))
			.numero((Integer) rs.getObject("numero"))
			.complemento(rs.getString("complemento"))
			.bairro(rs.getString("bairro"))
			.cidade(rs.getString("cidade"))
			.uf(rs.getString("uf"))
			.telefone(rs.getString("telefone"))
			.celular(rs.getString("celular"))
			.email(rs.getString("email"))
			.contato(rs.getString("contato"))
			.criado_em(rs.getTimestamp("criado_em") != null ? rs.getTimestamp("criado_em").toLocalDateTime() : null)
			.atualizado_em(rs.getTimestamp("atualizado_em") != null ? rs.getTimestamp("atualizado_em").toLocalDateTime() : null)
			.build();

	public ClienteResponse buscarPorDocumentoNormalizado(String documentoNormalizado) {
		String sql = """
				SELECT
					id,
					COALESCE(NULLIF(nome_fantasia, ''), NULLIF(razao_social, ''), NULLIF(nome, ''), 'Consumidor final') AS nome,
					COALESCE(NULLIF(cpf, ''), NULLIF(cnpj, '')) AS documento,
					cep, endereco, numero, complemento, bairro, cidade, uf, telefone, celular, email, contato,
					criado_em, atualizado_em
				FROM clientes
				WHERE documento_normalizado = :documentoNormalizado
				""";
		try {
			return namedParameterJdbcTemplate.queryForObject(sql,
					new MapSqlParameterSource("documentoNormalizado", documentoNormalizado), clienteMapper);
		} catch (EmptyResultDataAccessException exception) {
			return null;
		} catch (DataAccessException exception) {
			throw new DefaultErrorException("Erro ao consultar o cliente.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public List<ClienteResponse> buscarPorNome(String nome) {
		String sql = """
				SELECT
					id,
					COALESCE(NULLIF(nome_fantasia, ''), NULLIF(razao_social, ''), NULLIF(nome, ''), 'Consumidor final') AS nome,
					COALESCE(NULLIF(cpf, ''), NULLIF(cnpj, '')) AS documento,
					cep, endereco, numero, complemento, bairro, cidade, uf, telefone, celular, email, contato,
					criado_em, atualizado_em
				FROM clientes
				WHERE UPPER(COALESCE(nome_fantasia, razao_social, nome, '')) LIKE UPPER(:nome)
				ORDER BY
					CASE WHEN UPPER(COALESCE(nome_fantasia, razao_social, nome, '')) = UPPER(:nomeExato) THEN 0 ELSE 1 END,
					COALESCE(nome_fantasia, razao_social, nome) ASC,
					id ASC
				""";
		try {
			return namedParameterJdbcTemplate.query(sql, new MapSqlParameterSource()
					.addValue("nome", "%" + nome + "%")
					.addValue("nomeExato", nome), clienteMapper);
		} catch (DataAccessException exception) {
			throw new DefaultErrorException("Erro ao consultar o cliente.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
