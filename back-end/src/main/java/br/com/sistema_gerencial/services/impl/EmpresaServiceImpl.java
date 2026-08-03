package br.com.sistema_gerencial.services.impl;

import java.util.Map;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.sistema_gerencial.models.requests.AtualizarEmpresaRequest;
import br.com.sistema_gerencial.models.requests.CadastrarEmpresaRequest;
import br.com.sistema_gerencial.models.requests.RenovarContratoRequest;
import br.com.sistema_gerencial.models.response.EmpresaResponse;
import br.com.sistema_gerencial.models.response.RenovacaoContratoResponse;
import br.com.sistema_gerencial.repositories.EmpresaRepository;
import br.com.sistema_gerencial.services.EmpresaService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmpresaServiceImpl implements EmpresaService {

	private final EmpresaRepository repository;

	/**
	 * Executa o metodo cadastrar.
	 * @param request valor do parametro request.
	 */
	@Override
	@Transactional
	public void cadastrar(CadastrarEmpresaRequest request) {
		repository.cadastrar(request);
	}

	/**
	 * Executa o metodo listarPorPagina.
	 * @param limit valor do parametro limit.
	 * @param page valor do parametro page.
	 * @return resultado da operacao.
	 */
	@Override
	@Transactional
	public Map<String, Object> listarPorPagina(int limit, int page) {
		return repository.listarPorPagina(limit, page);
	}

	/**
	 * Executa o metodo listarPorPaginaENome.
	 * @param limit valor do parametro limit.
	 * @param page valor do parametro page.
	 * @param nome valor do parametro nome.
	 * @return resultado da operacao.
	 */
	@Override
	@Transactional
	public Map<String, Object> listarPorPaginaENome(int limit, int page, String nome) {
		return repository.listarPorPaginaENome(limit, page, nome);
	}

	/**
	 * Executa o metodo atualizar.
	 * @param request valor do parametro request.
	 */
	@Override
	@Transactional
	public void atualizar(AtualizarEmpresaRequest request) {
		repository.atualizar(request);
	}

	/**
	 * Executa o metodo excluir.
	 * @param id valor do parametro id.
	 */
	@Override
	@Transactional
	public void excluir(int id) {
		repository.excluir(id);
	}

	/**
	 * Executa o metodo buscarPorId.
	 * @param id valor do parametro id.
	 * @return resultado da operacao.
	 */
	@Override
	@Transactional
	public EmpresaResponse buscarPorId(int id) {
		return repository.buscarPorId(id);
	}

	/**
	 * Executa o metodo salvarInfraestrutura.
	 * @param texto valor do parametro texto.
	 * @param id valor do parametro id.
	 */
	@Override
	@Transactional
	public void salvarInfraestrutura(String texto, int id) {
		repository.salvarInfraEstrutura(texto, id);
	}

	@Override
	@Transactional
	public void renovarContrato(int id, RenovarContratoRequest request) {
		repository.renovarContrato(id, request);
	}

	@Override
	@Transactional(readOnly = true)
	public List<RenovacaoContratoResponse> listarRenovacoes(int id) {
		return repository.listarRenovacoes(id);
	}
}

