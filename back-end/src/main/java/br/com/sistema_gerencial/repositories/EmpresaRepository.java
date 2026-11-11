package br.com.sistema_gerencial.repositories;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.dao.DataAccessException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import org.springframework.jdbc.core.RowMapper;

import br.com.sistema_gerencial.exceptions.DefaultErrorException;
import br.com.sistema_gerencial.models.requests.AtualizarEmpresaRequest;
import br.com.sistema_gerencial.models.requests.CadastrarEmpresaRequest;
import br.com.sistema_gerencial.models.requests.RenovarContratoRequest;
import br.com.sistema_gerencial.models.response.EmpresaResponse;
import br.com.sistema_gerencial.models.response.RenovacaoContratoResponse;
import lombok.RequiredArgsConstructor;

/**
 * Consulta e persiste os dados de empresas por meio de SQL e JDBC.
 */
@Repository
@RequiredArgsConstructor
public class EmpresaRepository {

	private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;

	final RowMapper<EmpresaResponse> empresaMapper = (rs, rowNum) -> EmpresaResponse.builder().id(rs.getInt("id"))
			.tipo_pessoa(rs.getString("tipo_pessoa"))
			.nome_cliente(rs.getString("nome"))
			.nome_fantasia(rs.getString("nome_fantasia"))
			.razao_social(rs.getString("razao_social"))
			.cpf_cnpj(resolveCpfCnpj(rs.getString("cpf"), rs.getString("cnpj")))
			.cnpj(rs.getString("cnpj")).inscricao(rs.getString("inscricao"))
			.ie(rs.getString("inscricao"))
			.possui_contrato(rs.getBoolean("possui_contrato"))
			.teve_contrato(rs.getBoolean("teve_contrato"))
			.data_inicio(
					rs.getTimestamp("data_inicio") != null ? rs.getTimestamp("data_inicio").toLocalDateTime() : null)
			.data_fim(rs.getTimestamp("data_fim") != null ? rs.getTimestamp("data_fim").toLocalDateTime() : null)			
			.cep(rs.getString("cep")).endereco(rs.getString("endereco"))
			.numero(rs.getInt("numero")).complemento(rs.getString("complemento")).bairro(rs.getString("bairro"))
			.cidade(rs.getString("cidade")).uf(rs.getString("uf")).telefone(rs.getString("telefone"))
			.celular(rs.getString("celular")).email(rs.getString("email")).contato(rs.getString("contato"))
			.infraestrutura(rs.getString("infraestrutura"))
			.build();

	final RowMapper<RenovacaoContratoResponse> renovacaoMapper = (rs, rowNum) -> RenovacaoContratoResponse.builder()
			.id(rs.getInt("id"))
			.id_cliente(rs.getInt("id_cliente"))
			.data_inicio_anterior(rs.getTimestamp("data_inicio_anterior") != null
					? rs.getTimestamp("data_inicio_anterior").toLocalDateTime()
					: null)
			.data_fim_anterior(rs.getTimestamp("data_fim_anterior") != null
					? rs.getTimestamp("data_fim_anterior").toLocalDateTime()
					: null)
			.data_inicio_novo(rs.getTimestamp("data_inicio_novo") != null
					? rs.getTimestamp("data_inicio_novo").toLocalDateTime()
					: null)
			.data_fim_novo(rs.getTimestamp("data_fim_novo") != null
					? rs.getTimestamp("data_fim_novo").toLocalDateTime()
					: null)
			.observacoes(rs.getString("observacoes"))
			.criado_em(rs.getTimestamp("criado_em") != null ? rs.getTimestamp("criado_em").toLocalDateTime() : null)
			.build();

	/**
	 * Executa o metodo cadastrar.
	 * @param request valor do parametro request.
	 * @return resultado da operacao.
	 */
	public int cadastrar(CadastrarEmpresaRequest request) {
		KeyHolder keyHolder = new GeneratedKeyHolder();
		String tipoPessoa = normalizarTipoPessoa(request.getTipo_pessoa());
		String documento = resolveDocumento(request);
		String documentoInformado = normalizarDocumento(documento);
		String sql = """
				INSERT INTO clientes (
					tipo_cadastro, tipo_pessoa, nome_fantasia, razao_social, nome, cpf, cnpj,
					documento_normalizado, inscricao, possui_contrato, teve_contrato, data_inicio,
					data_fim, cep, endereco, numero, complemento, bairro, cidade, uf, telefone,
					celular, email, contato
				) VALUES (
					:tipo_cadastro, :tipo_pessoa, :nome_fantasia, :razao_social, :nome, :cpf, :cnpj,
					:documento_normalizado, :inscricao, :possui_contrato, :teve_contrato, :data_inicio,
					:data_fim, :cep, :endereco, :numero, :complemento, :bairro, :cidade, :uf, :telefone,
					:celular, :email, :contato
				)
				""";
		MapSqlParameterSource params = new MapSqlParameterSource()
				.addValue("tipo_cadastro", "CLIENTE")
				.addValue("tipo_pessoa", tipoPessoa)
				.addValue("nome_fantasia", resolveNomeFantasia(request))
				.addValue("razao_social", "j".equals(tipoPessoa) ? request.getRazao_social() : null)
				.addValue("nome", resolveNomeCliente(request))
				.addValue("cpf", "f".equals(tipoPessoa) ? documento : null)
				.addValue("cnpj", "j".equals(tipoPessoa) ? documento : null)
				.addValue("documento_normalizado", documentoInformado)
				.addValue("inscricao", resolveInscricaoEstadual(request))
				.addValue("possui_contrato", Boolean.TRUE.equals(request.getPossui_contrato()))
				.addValue("teve_contrato", Boolean.TRUE.equals(request.getPossui_contrato()) || Boolean.TRUE.equals(request.getTeve_contrato()))
				.addValue("data_inicio", request.getData_inicio()).addValue("data_fim", request.getData_fim())
				.addValue("cep", request.getCep()).addValue("endereco", request.getEndereco())
				.addValue("numero", request.getNumero()).addValue("complemento", request.getComplemento())
				.addValue("bairro", request.getBairro()).addValue("cidade", request.getCidade())
				.addValue("uf", request.getUf()).addValue("telefone", request.getTelefone())
				.addValue("celular", request.getCelular()).addValue("contato", request.getContato())
				.addValue("email", request.getEmail());
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
	 * @return resultado da operacao.
	 */
	public Map<String, Object> listarPorPagina(Integer limit, Integer page) {
		String sqlList = "SELECT * FROM clientes ORDER BY COALESCE(nome_fantasia, razao_social, nome) ASC LIMIT :limit OFFSET :offset";
		MapSqlParameterSource params = new MapSqlParameterSource().addValue("limit", limit).addValue("offset",
				(page - 1) * limit);

		try {
			List<EmpresaResponse> lista = namedParameterJdbcTemplate.query(sqlList, params, empresaMapper);

			String sqlCount = "SELECT COUNT(id) FROM clientes";
			Integer total = namedParameterJdbcTemplate.queryForObject(sqlCount, new MapSqlParameterSource(),
					Integer.class);

			Map<String, Object> resultado = new HashMap<>();
			resultado.put("lista", lista);
			resultado.put("total", total);

			return resultado;

		} catch (EmptyResultDataAccessException e) {
			throw new DefaultErrorException("Nenhuma empresa encontrada.", HttpStatus.NO_CONTENT);
		} catch (DataAccessException e) {			
			throw new DefaultErrorException("Erro ao consultar as empresas na base de dados.",
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Executa o metodo atualizar.
	 * @param request valor do parametro request.
	 */
	public void atualizar(AtualizarEmpresaRequest request) {
		String tipoPessoa = normalizarTipoPessoa(request.getTipo_pessoa());
		String documento = resolveDocumento(request);
		String documentoInformado = normalizarDocumento(documento);
		String sql = """
				UPDATE clientes
				SET tipo_pessoa = :tipo_pessoa,
				    nome_fantasia = :nome_fantasia,
				    razao_social = :razao_social,
				    nome = :nome,
				    cpf = :cpf,
				    cnpj = :cnpj,
				    documento_normalizado = :documento_normalizado,
				    inscricao = :inscricao,
				    possui_contrato = :possui_contrato,
				    teve_contrato = :teve_contrato,
				    data_inicio = :data_inicio,
				    data_fim = :data_fim,
				    cep = :cep,
				    endereco = :endereco,
				    numero = :numero,
				    complemento = :complemento,
				    bairro = :bairro,
				    cidade = :cidade,
				    uf = :uf,
				    telefone = :telefone,
				    celular = :celular,
				    email = :email,
				    contato = :contato
				WHERE id = :id
				""";
		MapSqlParameterSource params = new MapSqlParameterSource()
				.addValue("tipo_pessoa", tipoPessoa)
				.addValue("nome_fantasia", resolveNomeFantasia(request))
				.addValue("razao_social", "j".equals(tipoPessoa) ? request.getRazao_social() : null)
				.addValue("nome", resolveNomeCliente(request))
				.addValue("cpf", "f".equals(tipoPessoa) ? documento : null)
				.addValue("cnpj", "j".equals(tipoPessoa) ? documento : null)
				.addValue("documento_normalizado", documentoInformado)
				.addValue("inscricao", resolveInscricaoEstadual(request))
				.addValue("possui_contrato", Boolean.TRUE.equals(request.getPossui_contrato()))
				.addValue("teve_contrato", Boolean.TRUE.equals(request.getPossui_contrato()) || Boolean.TRUE.equals(request.getTeve_contrato()))
				.addValue("data_inicio", request.getData_inicio()).addValue("data_fim", request.getData_fim())
				.addValue("cep", request.getCep()).addValue("endereco", request.getEndereco())
				.addValue("numero", request.getNumero()).addValue("complemento", request.getComplemento())
				.addValue("bairro", request.getBairro()).addValue("cidade", request.getCidade())
				.addValue("uf", request.getUf()).addValue("telefone", request.getTelefone())
				.addValue("celular", request.getCelular()).addValue("contato", request.getContato())
				.addValue("email", request.getEmail())
				.addValue("id", request.getId());
		try {
			namedParameterJdbcTemplate.update(sql, params);
		} catch (DataAccessException e) {
			e.printStackTrace();
			throw new DefaultErrorException("Erro ao gravar os dados na base", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Executa o metodo buscarPorId.
	 * @param id valor do parametro id.
	 * @return resultado da operacao.
	 */
	public EmpresaResponse buscarPorId(int id) {
		String sql = "SELECT * FROM clientes WHERE id = :id";
		MapSqlParameterSource params = new MapSqlParameterSource().addValue("id", id);
		try {
			return namedParameterJdbcTemplate.<EmpresaResponse>queryForObject(sql, params, empresaMapper);

		} catch (EmptyResultDataAccessException e) {
			throw new DefaultErrorException("Nenhuma empresa encontrada.", HttpStatus.NO_CONTENT);
		} catch (DataAccessException e) {
			throw new DefaultErrorException("Erro ao consultar as empresas na base de dados.",
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Executa o metodo salvarInfraEstrutura.
	 * @param texto valor do parametro texto.
	 * @param id valor do parametro id.
	 */
	public void salvarInfraEstrutura(String texto, int id) {
		String sql = "UPDATE clientes set infraestrutura = :texto where id = :id";
		MapSqlParameterSource params = new MapSqlParameterSource().addValue("texto", texto).addValue("id", id);
		try {
			namedParameterJdbcTemplate.update(sql, params);
		} catch (DataAccessException e) {
			e.printStackTrace();
			throw new DefaultErrorException("Erro ao gravar os dados na base", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Executa o metodo listarPorPaginaENome.
	 * @param limit valor do parametro limit.
	 * @param page valor do parametro page.
	 * @param nome valor do parametro nome.
	 * @return resultado da operacao.
	 */
	public Map<String, Object> listarPorPaginaENome(int limit, int page, String nome) {
		String sqlList = """
				    SELECT * FROM clientes
				    /**
				     * Executa o metodo LOWER.
				     * @param LOWER(:nome_fantasia valor do parametro LOWER(:nome_fantasia.
				     * @return resultado da operacao.
				     */
				    WHERE LOWER(COALESCE(nome_fantasia, razao_social, nome, '')) LIKE LOWER(:nome_fantasia)
				    ORDER BY COALESCE(nome_fantasia, razao_social, nome) ASC
				    LIMIT :limit OFFSET :offset
				""";

		MapSqlParameterSource params = new MapSqlParameterSource().addValue("nome_fantasia", "%" + nome + "%")
				.addValue("limit", limit).addValue("offset", (page - 1) * limit);

		try {
			List<EmpresaResponse> lista = namedParameterJdbcTemplate.query(sqlList, params, empresaMapper);

			String sqlCount = """
					    /**
					     * Executa o metodo COUNT.
					     * @param LOWER(:nome_fantasia valor do parametro LOWER(:nome_fantasia.
					     * @return resultado da operacao.
					     */
					    SELECT COUNT(id)
					    FROM clientes
					    WHERE LOWER(COALESCE(nome_fantasia, razao_social, nome, '')) LIKE LOWER(:nome_fantasia)
					""";

			MapSqlParameterSource countParams = new MapSqlParameterSource().addValue("nome_fantasia", "%" + nome + "%");

			Integer total = namedParameterJdbcTemplate.queryForObject(sqlCount, countParams, Integer.class);

			Map<String, Object> resultado = new HashMap<>();
			resultado.put("lista", lista);
			resultado.put("total", total);

			return resultado;

		} catch (EmptyResultDataAccessException e) {
			throw new DefaultErrorException("Nenhuma empresa encontrada.", HttpStatus.NO_CONTENT);
		} catch (DataAccessException e) {
			e.printStackTrace();
			throw new DefaultErrorException("Erro ao consultar as empresas na base de dados.",
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Executa o metodo excluir.
	 * @param id valor do parametro id.
	 */
	public void excluir(Integer id) {
		String sql = "DELETE FROM clientes WHERE id = :id";
		MapSqlParameterSource params = new MapSqlParameterSource().addValue("id", id);
		try {
			namedParameterJdbcTemplate.update(sql, params);
		} catch (DataAccessException e) {
			throw new DefaultErrorException("Erro ao excluir o dado na base", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public void renovarContrato(Integer id, RenovarContratoRequest request) {
		EmpresaResponse cliente = buscarPorId(id);
		String sqlHistorico = """
				INSERT INTO contrato_renovacoes (
					id_cliente, data_inicio_anterior, data_fim_anterior, data_inicio_novo, data_fim_novo, observacoes
				) VALUES (
					:id_cliente, :data_inicio_anterior, :data_fim_anterior, :data_inicio_novo, :data_fim_novo, :observacoes
				)
				""";
		String sqlAtualizaCliente = """
				UPDATE clientes
				SET possui_contrato = TRUE,
				    teve_contrato = TRUE,
				    data_inicio = :data_inicio,
				    data_fim = :data_fim
				WHERE id = :id
				""";
		MapSqlParameterSource historicoParams = new MapSqlParameterSource()
				.addValue("id_cliente", id)
				.addValue("data_inicio_anterior", cliente.getData_inicio())
				.addValue("data_fim_anterior", cliente.getData_fim())
				.addValue("data_inicio_novo", request.getData_inicio())
				.addValue("data_fim_novo", request.getData_fim())
				.addValue("observacoes", request.getObservacoes());
		MapSqlParameterSource atualizaParams = new MapSqlParameterSource()
				.addValue("id", id)
				.addValue("data_inicio", request.getData_inicio())
				.addValue("data_fim", request.getData_fim());
		try {
			namedParameterJdbcTemplate.update(sqlHistorico, historicoParams);
			namedParameterJdbcTemplate.update(sqlAtualizaCliente, atualizaParams);
		} catch (DataAccessException e) {
			throw new DefaultErrorException("Erro ao renovar o contrato do cliente.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public List<RenovacaoContratoResponse> listarRenovacoes(Integer id) {
		String sql = """
				SELECT *
				FROM contrato_renovacoes
				WHERE id_cliente = :id
				ORDER BY data_fim_novo DESC, id DESC
				""";
		try {
			return namedParameterJdbcTemplate.query(sql, new MapSqlParameterSource("id", id), renovacaoMapper);
		} catch (DataAccessException e) {
			throw new DefaultErrorException("Erro ao consultar as renovacoes do contrato.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	private String normalizarDocumento(String documento) {
		if (documento == null) {
			return null;
		}
		String apenasDigitos = documento.replaceAll("\\D", "");
		return apenasDigitos.isBlank() ? null : apenasDigitos;
	}

	private String resolveCpfCnpj(String cpf, String cnpj) {
		if (cpf != null && !cpf.isBlank()) {
			return cpf;
		}
		if (cnpj != null && !cnpj.isBlank()) {
			return cnpj;
		}
		return null;
	}

	private String normalizarNomeCadastro(CadastrarEmpresaRequest request) {
		return normalizarNomeCadastro(request.getNome_fantasia(), request.getRazao_social());
	}

	private String normalizarNomeCadastro(String nomeFantasia, String razaoSocial) {
		if (nomeFantasia != null && !nomeFantasia.isBlank()) {
			return nomeFantasia.trim();
		}
		if (razaoSocial != null && !razaoSocial.isBlank()) {
			return razaoSocial.trim();
		}
		return null;
	}

	private String resolveDocumento(CadastrarEmpresaRequest request) {
		if (request.getCpf_cnpj() != null && !request.getCpf_cnpj().isBlank()) {
			return request.getCpf_cnpj();
		}
		return request.getCnpj();
	}

	private String resolveDocumento(AtualizarEmpresaRequest request) {
		if (request.getCpf_cnpj() != null && !request.getCpf_cnpj().isBlank()) {
			return request.getCpf_cnpj();
		}
		return request.getCnpj();
	}

	private String resolveInscricaoEstadual(CadastrarEmpresaRequest request) {
		if (request.getIe() != null && !request.getIe().isBlank()) {
			return request.getIe();
		}
		return request.getInscricao();
	}

	private String resolveInscricaoEstadual(AtualizarEmpresaRequest request) {
		if (request.getIe() != null && !request.getIe().isBlank()) {
			return request.getIe();
		}
		return request.getInscricao();
	}

	private String resolveNomeCliente(CadastrarEmpresaRequest request) {
		if (request.getNome_cliente() != null && !request.getNome_cliente().isBlank()) {
			return request.getNome_cliente().trim();
		}
		return normalizarNomeCadastro(request);
	}

	private String resolveNomeCliente(AtualizarEmpresaRequest request) {
		if (request.getNome_cliente() != null && !request.getNome_cliente().isBlank()) {
			return request.getNome_cliente().trim();
		}
		return normalizarNomeCadastro(request.getNome_fantasia(), request.getRazao_social());
	}

	private String resolveNomeFantasia(CadastrarEmpresaRequest request) {
		if ("f".equals(normalizarTipoPessoa(request.getTipo_pessoa()))) {
			return resolveNomeCliente(request);
		}
		return request.getNome_fantasia();
	}

	private String resolveNomeFantasia(AtualizarEmpresaRequest request) {
		if ("f".equals(normalizarTipoPessoa(request.getTipo_pessoa()))) {
			return resolveNomeCliente(request);
		}
		return request.getNome_fantasia();
	}

	private String normalizarTipoPessoa(String tipoPessoa) {
		return "f".equalsIgnoreCase(tipoPessoa) ? "f" : "j";
	}

}

