package br.com.sistema_gerencial.repositories;


import java.util.List;

import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import br.com.sistema_gerencial.exceptions.DefaultErrorException;
import br.com.sistema_gerencial.models.dto.AgendaEventoDTO;
import br.com.sistema_gerencial.models.dto.ContratoCalendarioDTO;
import br.com.sistema_gerencial.models.dto.LucroDTO;
import br.com.sistema_gerencial.models.dto.TipoAtendimentoDTO;
import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class DashboardRepository {

	private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;
	
	final RowMapper<LucroDTO> lucroMapper = (rs, rowNum) -> LucroDTO.builder()
			.mes(rs.getString("mes"))
			.valor(rs.getDouble("valor"))
			.build();
	
	final RowMapper<TipoAtendimentoDTO> tipoAtendimentoMapper = (rs, rowNum) -> {
	    TipoAtendimentoDTO dto = new TipoAtendimentoDTO();
	    dto.setTipo(rs.getString("tipo"));
	    dto.setQuantidade(rs.getInt("quantidade"));
	    return dto;
	};

	final RowMapper<ContratoCalendarioDTO> contratoCalendarioMapper = (rs, rowNum) -> ContratoCalendarioDTO.builder()
			.idEmpresa(rs.getInt("id_empresa"))
			.nomeFantasia(rs.getString("nome_fantasia"))
			.razaoSocial(rs.getString("razao_social"))
			.dataFim(rs.getTimestamp("data_fim") != null ? rs.getTimestamp("data_fim").toLocalDateTime() : null)
			.diasParaEncerrar(rs.getLong("dias_para_encerrar"))
			.build();

	final RowMapper<AgendaEventoDTO> agendaEventoMapper = (rs, rowNum) -> AgendaEventoDTO.builder()
			.tipo(rs.getString("tipo"))
			.referenciaId(rs.getInt("referencia_id"))
			.empresaId((Integer) rs.getObject("empresa_id"))
			.titulo(rs.getString("titulo"))
			.subtitulo(rs.getString("subtitulo"))
			.dataEvento(rs.getTimestamp("data_evento") != null ? rs.getTimestamp("data_evento").toLocalDateTime() : null)
			.concluido(rs.getBoolean("concluido"))
			.build();

	/**
	 * Executa o metodo buildExecutorPattern.
	 * @param executorNome valor do parametro executorNome.
	 * @return resultado da operacao.
	 */
	private String buildExecutorPattern(String executorNome) {
		return "%\\\"nome\\\":\\\"" + executorNome + "\\\"%";
	}
	
	/**
	 * Executa o metodo retornarLucrosDoMes.
	 * @return resultado da operacao.
	 */
	public double retornarLucrosDoMes() {
		String sql =
			    "SELECT " +
			    	    " (SELECT COALESCE(SUM(valor_servico),0) FROM atendimentos " +
			    	    "   WHERE data_fim >= DATE_FORMAT(NOW(), '%Y-%m-01') " +
			    	    "   AND data_fim < DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')) + " +

			    	    " (SELECT COALESCE(SUM(valor_servico),0) FROM avulsos " +
			    	    "   WHERE data_fim >= DATE_FORMAT(NOW(), '%Y-%m-01') " +
			    	    "   AND data_fim < DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')) + " +

			    	    " (SELECT COALESCE(SUM(valor_servico),0) FROM manutencao " +
			    	    "   WHERE data_fim >= DATE_FORMAT(NOW(), '%Y-%m-01') " +
			    	    "   AND data_fim < DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')) " +
			    	    " AS total_geral";		

		try {
			Double valor = namedParameterJdbcTemplate.queryForObject(
					sql,
			        new MapSqlParameterSource(),
			        Double.class
			);
			
			return valor;

		}  catch (DataAccessException e) {
			throw new DefaultErrorException("Erro ao consultar a soma na base de dados.",
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	/**
	 * Executa o metodo retornarLucrosDoAno.
	 * @return resultado da operacao.
	 */
	public double retornarLucrosDoAno() {
		String sql =
				"SELECT " +
					    " (SELECT COALESCE(SUM(valor_servico),0) FROM atendimentos " +
					    "   WHERE data_fim >= DATE_FORMAT(NOW(), '%Y-01-01') " +
					    "   AND data_fim < DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 1 YEAR), '%Y-01-01')) + " +

					    " (SELECT COALESCE(SUM(valor_servico),0) FROM avulsos " +
					    "   WHERE data_fim >= DATE_FORMAT(NOW(), '%Y-01-01') " +
					    "   AND data_fim < DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 1 YEAR), '%Y-01-01')) + " +

					    " (SELECT COALESCE(SUM(valor_servico),0) FROM manutencao " +
					    "   WHERE data_fim >= DATE_FORMAT(NOW(), '%Y-01-01') " +
					    "   AND data_fim < DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 1 YEAR), '%Y-01-01')) " +
					    " AS total_geral";		

		try {
			Double valor = namedParameterJdbcTemplate.queryForObject(
					sql,
			        new MapSqlParameterSource(),
			        Double.class
			);
			
			return valor;

		}  catch (DataAccessException e) {
			throw new DefaultErrorException("Erro ao consultar a soma na base de dados.",
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	/**
	 * Executa o metodo retornarContratosAcabando.
	 * @return resultado da operacao.
	 */
	public int retornarContratosAcabando() {
		String sql =
			    "SELECT COUNT(*) AS total " +
			    "FROM clientes " +
			    "WHERE data_fim >= NOW() " +
			    "AND data_fim < DATE_ADD(NOW(), INTERVAL 30 DAY)";
		try {
			Integer valor = namedParameterJdbcTemplate.queryForObject(
					sql,
			        new MapSqlParameterSource(),
			        Integer.class
			);
			
			return valor;

		}  catch (DataAccessException e) {
			e.printStackTrace();
			throw new DefaultErrorException("Erro ao consultar a soma na base de dados.",
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	/**
	 * Executa o metodo retornarTotalCancelados.
	 * @return resultado da operacao.
	 */
	public int retornarTotalCancelados() {
		String sql =
			    "SELECT COUNT(*) AS total_cancelados " +
			    "FROM ( " +
			    "  SELECT id FROM atendimentos WHERE status_atendimento = 4 " +
			    "  UNION ALL " +
			    "  SELECT id FROM manutencao WHERE status_atendimento = 4 " +
			    "  UNION ALL " +
			    "  SELECT id FROM avulsos WHERE status_atendimento = 4 " +
			    ") t";
		
		try {
			Integer valor = namedParameterJdbcTemplate.queryForObject(
					sql,
			        new MapSqlParameterSource(),
			        Integer.class
			);
			
			return valor;

		}  catch (DataAccessException e) {
			e.printStackTrace();
			throw new DefaultErrorException("Erro ao consultar a soma na base de dados.",
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Executa o metodo retornarTotalChamadosMesPorExecutor.
	 * @param executorNome valor do parametro executorNome.
	 * @return resultado da operacao.
	 */
	public int retornarTotalChamadosMesPorExecutor(String executorNome) {
		String sql =
			    "SELECT COUNT(*) AS total " +
			    "FROM ( " +
			    "  SELECT data_inicio, executores FROM atendimentos " +
			    "  UNION ALL " +
			    "  SELECT data_inicio, executores FROM manutencao " +
			    "  UNION ALL " +
			    "  SELECT data_inicio, executores FROM avulsos " +
			    ") t " +
			    "WHERE data_inicio >= DATE_FORMAT(NOW(), '%Y-%m-01') " +
			    "AND data_inicio < DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 1 MONTH), '%Y-%m-01') " +
			    "AND executores LIKE :executor";

		MapSqlParameterSource params = new MapSqlParameterSource()
				.addValue("executor", buildExecutorPattern(executorNome));

		try {
			Integer valor = namedParameterJdbcTemplate.queryForObject(sql, params, Integer.class);
			return valor;
		} catch (DataAccessException e) {
			throw new DefaultErrorException("Erro ao consultar a soma na base de dados.",
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Executa o metodo retornarTotalChamadosAtrasadosPorExecutor.
	 * @param executorNome valor do parametro executorNome.
	 * @return resultado da operacao.
	 */
	public int retornarTotalChamadosAtrasadosPorExecutor(String executorNome) {
		String sql =
			    "SELECT COUNT(*) AS total " +
			    "FROM ( " +
			    "  SELECT data_fim, status_atendimento, executores FROM atendimentos " +
			    "  UNION ALL " +
			    "  SELECT data_fim, status_atendimento, executores FROM manutencao " +
			    "  UNION ALL " +
			    "  SELECT data_fim, status_atendimento, executores FROM avulsos " +
			    ") t " +
			    "WHERE data_fim < NOW() " +
			    "AND status_atendimento NOT IN (3, 4) " +
			    "AND executores LIKE :executor";

		MapSqlParameterSource params = new MapSqlParameterSource()
				.addValue("executor", buildExecutorPattern(executorNome));

		try {
			Integer valor = namedParameterJdbcTemplate.queryForObject(sql, params, Integer.class);
			return valor;
		} catch (DataAccessException e) {
			throw new DefaultErrorException("Erro ao consultar a soma na base de dados.",
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Executa o metodo retornarTotalChamadosFinalizadosPorExecutor.
	 * @param executorNome valor do parametro executorNome.
	 * @return resultado da operacao.
	 */
	public int retornarTotalChamadosFinalizadosPorExecutor(String executorNome) {
		String sql =
			    "SELECT COUNT(*) AS total " +
			    "FROM ( " +
			    "  SELECT status_atendimento, executores FROM atendimentos " +
			    "  UNION ALL " +
			    "  SELECT status_atendimento, executores FROM manutencao " +
			    "  UNION ALL " +
			    "  SELECT status_atendimento, executores FROM avulsos " +
			    ") t " +
			    "WHERE status_atendimento = 3 " +
			    "AND executores LIKE :executor";

		MapSqlParameterSource params = new MapSqlParameterSource()
				.addValue("executor", buildExecutorPattern(executorNome));

		try {
			Integer valor = namedParameterJdbcTemplate.queryForObject(sql, params, Integer.class);
			return valor;
		} catch (DataAccessException e) {
			throw new DefaultErrorException("Erro ao consultar a soma na base de dados.",
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Executa o metodo retornarTotalProdutosEmFalta.
	 * @return resultado da operacao.
	 */
	public int retornarTotalProdutosEmFalta() {
		String sql = """
				SELECT COUNT(*)
				FROM produtos
				WHERE ativo = TRUE
				  AND estoque_atual < estoque_minimo
				""";

		try {
			Integer valor = namedParameterJdbcTemplate.queryForObject(
					sql,
			        new MapSqlParameterSource(),
			        Integer.class
			);

			return valor == null ? 0 : valor;
		} catch (DataAccessException e) {
			e.printStackTrace();
			throw new DefaultErrorException("Erro ao consultar os produtos em falta na base de dados.",
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	/**
	 * Executa o metodo retornarTotalPorMes.
	 * @return resultado da operacao.
	 */
	public List<LucroDTO> retornarTotalPorMes(){
		String sql =
			    "SELECT " +
			    "    mes_num, " +
			    "    CASE mes_num " +
			    "        WHEN 1 THEN 'janeiro' " +
			    "        WHEN 2 THEN 'fevereiro' " +
			    "        WHEN 3 THEN 'marco' " +
			    "        WHEN 4 THEN 'abril' " +
			    "        WHEN 5 THEN 'maio' " +
			    "        WHEN 6 THEN 'junho' " +
			    "        WHEN 7 THEN 'julho' " +
			    "        WHEN 8 THEN 'agosto' " +
			    "        WHEN 9 THEN 'setembro' " +
			    "        WHEN 10 THEN 'outubro' " +
			    "        WHEN 11 THEN 'novembro' " +
			    "        WHEN 12 THEN 'dezembro' " +
			    "    END AS mes, " +
			    "    SUM(valor_servico) AS valor " +
			    "FROM ( " +
			    "    SELECT MONTH(data_fim) AS mes_num, valor_servico FROM atendimentos " +
			    "    WHERE data_fim >= DATE_FORMAT(NOW(), '%Y-01-01') " +
			    "      AND data_fim < DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 1 YEAR), '%Y-01-01') " +

			    "    UNION ALL " +

			    "    SELECT MONTH(data_fim) AS mes_num, valor_servico FROM manutencao " +
			    "    WHERE data_fim >= DATE_FORMAT(NOW(), '%Y-01-01') " +
			    "      AND data_fim < DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 1 YEAR), '%Y-01-01') " +

			    "    UNION ALL " +

			    "    SELECT MONTH(data_fim) AS mes_num, valor_servico FROM avulsos " +
			    "    WHERE data_fim >= DATE_FORMAT(NOW(), '%Y-01-01') " +
			    "      AND data_fim < DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 1 YEAR), '%Y-01-01') " +
			    ") t " +
			    "GROUP BY mes_num " +
			    "ORDER BY mes_num";
		
		try {
			List<LucroDTO> lista = namedParameterJdbcTemplate.query(sql,lucroMapper);
			return lista;
		} catch (DataAccessException e) {
			e.printStackTrace();
			throw new DefaultErrorException("Erro ao gravar os dados na base", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Executa o metodo retornarTotalVendasPorMes.
	 * @return resultado da operacao.
	 */
	public List<LucroDTO> retornarTotalVendasPorMes() {
		String sql = """
				SELECT
				    meses.mes_num,
				    CASE meses.mes_num
				        WHEN 1 THEN 'janeiro'
				        WHEN 2 THEN 'fevereiro'
				        WHEN 3 THEN 'marco'
				        WHEN 4 THEN 'abril'
				        WHEN 5 THEN 'maio'
				        WHEN 6 THEN 'junho'
				        WHEN 7 THEN 'julho'
				        WHEN 8 THEN 'agosto'
				        WHEN 9 THEN 'setembro'
				        WHEN 10 THEN 'outubro'
				        WHEN 11 THEN 'novembro'
				        WHEN 12 THEN 'dezembro'
				    END AS mes,
				    COALESCE(SUM(v.total_geral), 0) AS valor
				FROM (
				    SELECT 1 AS mes_num UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
				    UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8
				    UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12
				) meses
				LEFT JOIN vendas v
				    ON MONTH(v.data_venda) = meses.mes_num
				   AND v.data_venda >= DATE_FORMAT(NOW(), '%Y-01-01')
				   AND v.data_venda < DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 1 YEAR), '%Y-01-01')
				GROUP BY meses.mes_num
				ORDER BY meses.mes_num
				""";

		try {
			return namedParameterJdbcTemplate.query(sql, lucroMapper);
		} catch (DataAccessException e) {
			e.printStackTrace();
			throw new DefaultErrorException("Erro ao consultar as vendas por mes na base de dados.",
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	/**
	 * Executa o metodo retornarQuantidadeAtendimentoPorTipo.
	 * @return resultado da operacao.
	 */
	public List<TipoAtendimentoDTO> retornarQuantidadeAtendimentoPorTipo() {
		String sql =
			    "SELECT " +
			    "    TRIM(tipo_atendimento) AS tipo, " +
			    "    COUNT(*) AS quantidade " +
			    "FROM ( " +
			    "    SELECT tipo_atendimento FROM atendimentos " +
			    "    UNION ALL " +
			    "    SELECT tipo_atendimento FROM manutencao " +
			    "    UNION ALL " +
			    "    SELECT tipo_atendimento FROM avulsos " +
			    ") t " +
			    "WHERE UPPER(TRIM(tipo_atendimento)) IN ('REMOTO', 'PRESENCIAL') " +
			    "GROUP BY TRIM(tipo_atendimento) " +
			    "ORDER BY tipo";
		
		try {
			List<TipoAtendimentoDTO> lista = namedParameterJdbcTemplate.query(sql,tipoAtendimentoMapper);
			return lista;
		} catch (DataAccessException e) {
			e.printStackTrace();
			throw new DefaultErrorException("Erro ao gravar os dados na base", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Executa o metodo retornarTotalChamadosPorMesPorExecutor.
	 * @param executorNome valor do parametro executorNome.
	 * @return resultado da operacao.
	 */
	public List<LucroDTO> retornarTotalChamadosPorMesPorExecutor(String executorNome){
		String sql =
			    "SELECT " +
			    "    mes_num, " +
			    "    CASE mes_num " +
			    "        WHEN 1 THEN 'janeiro' " +
			    "        WHEN 2 THEN 'fevereiro' " +
			    "        WHEN 3 THEN 'marco' " +
			    "        WHEN 4 THEN 'abril' " +
			    "        WHEN 5 THEN 'maio' " +
			    "        WHEN 6 THEN 'junho' " +
			    "        WHEN 7 THEN 'julho' " +
			    "        WHEN 8 THEN 'agosto' " +
			    "        WHEN 9 THEN 'setembro' " +
			    "        WHEN 10 THEN 'outubro' " +
			    "        WHEN 11 THEN 'novembro' " +
			    "        WHEN 12 THEN 'dezembro' " +
			    "    END AS mes, " +
			    "    COUNT(*) AS valor " +
			    "FROM ( " +
			    "    SELECT MONTH(data_inicio) AS mes_num FROM atendimentos " +
			    "    WHERE data_inicio >= DATE_FORMAT(NOW(), '%Y-01-01') " +
			    "      AND data_inicio < DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 1 YEAR), '%Y-01-01') " +
			    "      AND executores LIKE :executor " +

			    "    UNION ALL " +

			    "    SELECT MONTH(data_inicio) AS mes_num FROM manutencao " +
			    "    WHERE data_inicio >= DATE_FORMAT(NOW(), '%Y-01-01') " +
			    "      AND data_inicio < DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 1 YEAR), '%Y-01-01') " +
			    "      AND executores LIKE :executor " +

			    "    UNION ALL " +

			    "    SELECT MONTH(data_inicio) AS mes_num FROM avulsos " +
			    "    WHERE data_inicio >= DATE_FORMAT(NOW(), '%Y-01-01') " +
			    "      AND data_inicio < DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 1 YEAR), '%Y-01-01') " +
			    "      AND executores LIKE :executor " +
			    ") t " +
			    "GROUP BY mes_num " +
			    "ORDER BY mes_num";

		MapSqlParameterSource params = new MapSqlParameterSource()
				.addValue("executor", buildExecutorPattern(executorNome));

		try {
			return namedParameterJdbcTemplate.query(sql, params, lucroMapper);
		} catch (DataAccessException e) {
			e.printStackTrace();
			throw new DefaultErrorException("Erro ao gravar os dados na base", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Executa o metodo retornarQuantidadeAtendimentoPorTipoPorExecutor.
	 * @param executorNome valor do parametro executorNome.
	 * @return resultado da operacao.
	 */
	public List<TipoAtendimentoDTO> retornarQuantidadeAtendimentoPorTipoPorExecutor(String executorNome) {
		String sql =
			    "SELECT " +
			    "    TRIM(tipo_atendimento) AS tipo, " +
			    "    COUNT(*) AS quantidade " +
			    "FROM ( " +
			    "    SELECT tipo_atendimento FROM atendimentos WHERE executores LIKE :executor " +
			    "    UNION ALL " +
			    "    SELECT tipo_atendimento FROM manutencao WHERE executores LIKE :executor " +
			    "    UNION ALL " +
			    "    SELECT tipo_atendimento FROM avulsos WHERE executores LIKE :executor " +
			    ") t " +
			    "WHERE UPPER(TRIM(tipo_atendimento)) IN ('REMOTO', 'PRESENCIAL') " +
			    "GROUP BY TRIM(tipo_atendimento) " +
			    "ORDER BY tipo";

		MapSqlParameterSource params = new MapSqlParameterSource()
				.addValue("executor", buildExecutorPattern(executorNome));

		try {
			return namedParameterJdbcTemplate.query(sql, params, tipoAtendimentoMapper);
		} catch (DataAccessException e) {
			e.printStackTrace();
			throw new DefaultErrorException("Erro ao gravar os dados na base", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Executa o metodo retornarContratosCalendario.
	 * @return resultado da operacao.
	 */
	public List<ContratoCalendarioDTO> retornarContratosCalendario() {
		String sql = """
				SELECT
					id AS id_empresa,
					COALESCE(NULLIF(nome_fantasia, ''), NULLIF(razao_social, ''), NULLIF(nome, ''), 'Consumidor final') AS nome_fantasia,
					razao_social,
					data_fim,
					TIMESTAMPDIFF(DAY, NOW(), data_fim) AS dias_para_encerrar
				FROM clientes
				WHERE data_fim IS NOT NULL
				ORDER BY data_fim ASC, nome_fantasia ASC
				""";

		try {
			return namedParameterJdbcTemplate.query(sql, contratoCalendarioMapper);
		} catch (DataAccessException e) {
			e.printStackTrace();
			throw new DefaultErrorException("Erro ao consultar os contratos na base de dados.",
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Executa o metodo retornarAgendaEventos.
	 * @return resultado da operacao.
	 */
	public List<AgendaEventoDTO> retornarAgendaEventos() {
		String sql = """
				SELECT tipo, referencia_id, empresa_id, titulo, subtitulo, data_evento, concluido
				FROM (
					SELECT
						'FINALIZACAO_CONTRATO' AS tipo,
						e.id AS referencia_id,
						e.id AS empresa_id,
						COALESCE(NULLIF(e.nome_fantasia, ''), NULLIF(e.razao_social, ''), NULLIF(e.nome, ''), 'Consumidor final') AS titulo,
						'Finalizacao de contrato' AS subtitulo,
						e.data_fim AS data_evento,
						CASE WHEN e.data_fim <= NOW() THEN TRUE ELSE FALSE END AS concluido
					FROM clientes e
					WHERE e.data_fim IS NOT NULL

					UNION ALL

					SELECT
						'ORDEM_SERVICO' AS tipo,
						a.id AS referencia_id,
						NULL AS empresa_id,
						a.nome_cliente AS titulo,
						'Ordem de servico' AS subtitulo,
						a.data_inicio AS data_evento,
						CASE WHEN a.status_atendimento = 3 THEN TRUE ELSE FALSE END AS concluido
					FROM avulsos a
					WHERE a.data_inicio IS NOT NULL

					UNION ALL

					SELECT
						'AGENDAMENTO' AS tipo,
						ag.id AS referencia_id,
						NULL AS empresa_id,
						ag.titulo AS titulo,
						CONCAT(ag.tipo_tarefa, ' - ', COALESCE(ag.detalhes, 'Sem detalhes')) AS subtitulo,
						ag.data_agendamento AS data_evento,
						ag.concluido AS concluido
					FROM agendamentos ag
					WHERE ag.data_agendamento IS NOT NULL

					UNION ALL

					SELECT
						'ATENDIMENTO' AS tipo,
						at.id AS referencia_id,
						at.id_empresa AS empresa_id,
						COALESCE(NULLIF(e.nome_fantasia, ''), NULLIF(e.razao_social, ''), NULLIF(e.nome, ''), 'Consumidor final') AS titulo,
						CONCAT('Atendimento - ', COALESCE(at.solicitante, 'Sem solicitante')) AS subtitulo,
						at.data_inicio AS data_evento,
						CASE WHEN at.status_atendimento = 3 THEN TRUE ELSE FALSE END AS concluido
					FROM atendimentos at
					LEFT JOIN clientes e ON e.id = at.id_empresa
					WHERE at.data_inicio IS NOT NULL

					UNION ALL

					SELECT
						'MANUTENCAO' AS tipo,
						m.id AS referencia_id,
						e.id AS empresa_id,
						COALESCE(eq.nome_maquina, e.nome_fantasia, e.razao_social, e.nome, 'Equipamento') AS titulo,
						CONCAT('Manutencao - ', COALESCE(e.nome_fantasia, e.razao_social, e.nome, 'Sem cliente')) AS subtitulo,
						m.data_inicio AS data_evento,
						CASE WHEN m.status_atendimento = 3 THEN TRUE ELSE FALSE END AS concluido
					FROM manutencao m
					LEFT JOIN equipamentos eq ON eq.id = m.id_equipamento
					LEFT JOIN clientes e ON e.id = eq.id_empresa
					WHERE m.data_inicio IS NOT NULL
				) agenda
				ORDER BY data_evento ASC, titulo ASC
				""";

		try {
			return namedParameterJdbcTemplate.query(sql, agendaEventoMapper);
		} catch (DataAccessException e) {
			e.printStackTrace();
			throw new DefaultErrorException("Erro ao consultar os eventos da agenda na base de dados.",
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}

