package br.com.sistema_gerencial.repositories;

import java.sql.ResultSet;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;

import br.com.sistema_gerencial.exceptions.DefaultErrorException;
import br.com.sistema_gerencial.models.dto.LoginDTO;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LoginRepositoryTest {

    private LoginRepository loginRepository;

    @Mock
    private NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    @BeforeEach
    void setUp() {
        loginRepository = new LoginRepository(namedParameterJdbcTemplate);
    }

    @SuppressWarnings("unchecked")
    @Test
    void testBuscarPorLoginESenhaSuccess() throws Exception {
        String login = "usuario-teste";
        String senha = "123";

        doAnswer(invocation -> {
            RowMapper<LoginDTO> rowMapper = invocation.getArgument(2);

            ResultSet rs = mock(ResultSet.class);
            when(rs.getString("nome")).thenReturn("Nome Teste");
            when(rs.getString("login")).thenReturn(login);
            when(rs.getString("senha")).thenReturn(senha);
            when(rs.getString("perfil")).thenReturn("USER");

            return rowMapper.mapRow(rs, 1);
        }).when(namedParameterJdbcTemplate).queryForObject(anyString(), any(MapSqlParameterSource.class), any(RowMapper.class));

        LoginDTO result = loginRepository.buscarPorLoginESenha(login, senha);

        Assertions.assertNotNull(result);
        Assertions.assertEquals("Nome Teste", result.getNome());
        Assertions.assertEquals(login, result.getLogin());
        Assertions.assertEquals(senha, result.getSenha());
        Assertions.assertEquals("USER", result.getPerfil());
    }

    @SuppressWarnings("unchecked")
    @Test
    void testBuscarPorLoginESenhaNotFound() {
        when(namedParameterJdbcTemplate.queryForObject(anyString(), any(MapSqlParameterSource.class), any(RowMapper.class)))
                .thenThrow(EmptyResultDataAccessException.class);

        LoginDTO result = loginRepository.buscarPorLoginESenha("usuario-invalido", "senha-invalida");

        Assertions.assertNull(result);
        verify(namedParameterJdbcTemplate).queryForObject(anyString(), any(MapSqlParameterSource.class), any(RowMapper.class));
    }

    @SuppressWarnings({ "unchecked", "serial" })
    @Test
    void testBuscarPorLoginESenhaException() {
        when(namedParameterJdbcTemplate.queryForObject(anyString(), any(MapSqlParameterSource.class), any(RowMapper.class)))
                .thenThrow(new DataAccessException("falha") {
                });

        DefaultErrorException ex = Assertions.assertThrows(DefaultErrorException.class,
                () -> loginRepository.buscarPorLoginESenha("usuario-teste", "123"));

        Assertions.assertEquals("Erro ao consultar os dados na base", ex.getMessage());
        Assertions.assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, ex.getStatus());
    }
}
