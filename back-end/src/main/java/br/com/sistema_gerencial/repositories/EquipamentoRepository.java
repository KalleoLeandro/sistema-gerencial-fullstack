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
import br.com.sistema_gerencial.models.requests.AtualizarEquipamentoRequest;
import br.com.sistema_gerencial.models.requests.CadastrarEquipamentoRequest;
import br.com.sistema_gerencial.models.response.EquipamentoResponse;
import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class EquipamentoRepository {
	
	private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;
	
	final RowMapper<EquipamentoResponse> equipamentoMapper = (rs, rowNum) -> EquipamentoResponse.builder()
			.id(rs.getInt("id"))
			.nome_maquina(rs.getString("nome_maquina"))
			.setor(rs.getString("setor"))
			.tipo_equipamento(rs.getString("tipo_equipamento"))
			.placa_mae(rs.getString("placa_mae"))
			.marca(rs.getString("marca"))
			.modelo(rs.getString("modelo"))
			.numero_serie(rs.getString("numero_serie"))
			.processador(rs.getString("processador"))
			.memoria(rs.getString("memoria"))
			.hd_ssd(rs.getString("hd_ssd"))
			.fonte(rs.getString("fonte"))
			.gabinete(rs.getString("gabinete"))						
			.id_empresa(rs.getInt("id_empresa"))
			.observacoes(rs.getString("observacoes"))
			.build();

	
	/**
	 * Executa o metodo cadastrar.
	 * @param request valor do parametro request.
	 * @return resultado da operacao.
	 */
	public int cadastrar(CadastrarEquipamentoRequest request) {
		KeyHolder keyHolder = new GeneratedKeyHolder();
		String sql = "INSERT INTO equipamentos(nome_maquina, setor, tipo_equipamento, placa_mae, marca, modelo, numero_serie, processador, memoria, hd_ssd, fonte, gabinete, id_empresa, observacoes) values("
				+ ":nome_maquina, :setor, :tipo_equipamento, :placa_mae, :marca, :modelo, :numero_serie, :processador, :memoria, :hd_ssd, :fonte, :gabinete, :id_empresa, :observacoes)";
		MapSqlParameterSource params = new MapSqlParameterSource().addValue("nome_maquina", request.getNome_maquina())
				.addValue("setor", request.getSetor())
				.addValue("tipo_equipamento", request.getTipo_equipamento())
				.addValue("placa_mae", request.getPlaca_mae())
				.addValue("marca", request.getMarca())
				.addValue("modelo", request.getModelo())
				.addValue("numero_serie", request.getNumero_serie())
				.addValue("processador", request.getProcessador())
				.addValue("memoria", request.getMemoria())
				.addValue("hd_ssd", request.getHd_ssd())
				.addValue("fonte", request.getFonte())
				.addValue("gabinete", request.getGabinete())
				.addValue("id_empresa", request.getId_empresa())
				.addValue("observacoes", request.getObservacoes());

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
	 * @param id_empresa valor do parametro id_empresa.
	 * @return resultado da operacao.
	 */
	public Map<String, Object> listarPorPagina(Integer limit, Integer page, int id_empresa) {
		String sqlList = "SELECT * FROM equipamentos WHERE id_empresa = :id_empresa ORDER BY id DESC LIMIT :limit OFFSET :offset";
		MapSqlParameterSource params = new MapSqlParameterSource()
				.addValue("id_empresa", id_empresa)
				.addValue("limit", limit)
				.addValue("offset", (page - 1) * limit);

		try {
			List<EquipamentoResponse> lista = namedParameterJdbcTemplate.query(sqlList, params, equipamentoMapper);

			String sqlCount = "SELECT COUNT(id) FROM equipamentos";
			Integer total = namedParameterJdbcTemplate.queryForObject(sqlCount, new MapSqlParameterSource(),
					Integer.class);

			Map<String, Object> resultado = new HashMap<>();
			resultado.put("lista", lista);
			resultado.put("total", total);

			return resultado;

		} catch (EmptyResultDataAccessException e) {
			throw new DefaultErrorException("Nenhum equipamento encontrado.", HttpStatus.NO_CONTENT);
		} catch (DataAccessException e) {
			e.printStackTrace();
			throw new DefaultErrorException("Erro ao consultar os equipamentos na base de dados.",
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	
	/**
	 * Executa o metodo buscarPorId.
	 * @param id valor do parametro id.
	 * @return resultado da operacao.
	 */
	public EquipamentoResponse buscarPorId(int id) {
		String sql = "SELECT * FROM equipamentos WHERE id = :id";
		MapSqlParameterSource params = new MapSqlParameterSource().addValue("id", id);
		try {
			return namedParameterJdbcTemplate.<EquipamentoResponse>queryForObject(sql, params, equipamentoMapper);

		} catch (EmptyResultDataAccessException e) {
			throw new DefaultErrorException("Nenhum equipamento encontrado.", HttpStatus.NO_CONTENT);
		} catch (DataAccessException e) {
			throw new DefaultErrorException("Erro ao consultar o equipamento na base de dados.",
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	
	/**
	 * Executa o metodo atualizar.
	 * @param request valor do parametro request.
	 */
	public void atualizar(AtualizarEquipamentoRequest request) {
		String sql = "UPDATE equipamentos set id_empresa = :id_empresa, nome_maquina = :nome_maquina, setor = :setor, tipo_equipamento = :tipo_equipamento, "
				+ "placa_mae = :placa_mae, marca = :marca, modelo = :modelo, numero_serie = :numero_serie, processador = :processador, memoria = :memoria, hd_ssd = :hd_ssd, fonte = :fonte, "
				+ "gabinete = :gabinete, observacoes = :observacoes WHERE id = :id";
		
		MapSqlParameterSource params = new MapSqlParameterSource().addValue("id_empresa", request.getId_empresa())
				.addValue("nome_maquina", request.getNome_maquina())
				.addValue("setor", request.getSetor())
				.addValue("tipo_equipamento", request.getTipo_equipamento())
				.addValue("placa_mae", request.getPlaca_mae())
				.addValue("marca", request.getMarca())
				.addValue("modelo", request.getModelo())
				.addValue("numero_serie", request.getNumero_serie())
				.addValue("processador", request.getProcessador())
				.addValue("memoria", request.getMemoria())
				.addValue("hd_ssd", request.getHd_ssd())
				.addValue("fonte", request.getFonte())
				.addValue("gabinete", request.getGabinete())	
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
	 * Executa o metodo excluir.
	 * @param id valor do parametro id.
	 */
	public void excluir(Integer id) {
		String sql = "DELETE FROM equipamentos WHERE id = :id";
		MapSqlParameterSource params = new MapSqlParameterSource().addValue("id", id);
		try {
			namedParameterJdbcTemplate.update(sql, params);
		} catch (DataAccessException e) {		
			e.printStackTrace();
			throw new DefaultErrorException("Erro ao excluir o dado na base", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}

