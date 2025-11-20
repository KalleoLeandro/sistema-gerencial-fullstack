package br.com.sistema_gerencial.repositories;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import br.com.sistema_gerencial.exceptions.DefaultErrorException;
import br.com.sistema_gerencial.models.dto.LoginDTO;
import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class LoginRepository {

	private static final Logger logger = LoggerFactory.getLogger(LoginRepository.class);

	private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;

	final RowMapper<LoginDTO> loginMapper = (rs, rowNum) -> LoginDTO.builder().nome(rs.getString("nome")).perfil(rs.getString("perfil")).build();

	public LoginDTO buscarPorLoginESenha(String login, String senha) {

		String sql = "SELECT nome, perfil FROM login WHERE login = :login AND senha = :senha";

		MapSqlParameterSource params = new MapSqlParameterSource().addValue("login", login).addValue("senha", senha);

		try {
			return namedParameterJdbcTemplate.<LoginDTO>queryForObject(sql, params, loginMapper);
		} catch (EmptyResultDataAccessException e) {
			return null;
		} catch (DataAccessException e) {
			logger.error(e.getMessage());
			throw new DefaultErrorException("Erro ao consultar os dados na base", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
