package br.com.sistema_gerencial.services.impl;

import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.sistema_gerencial.models.requests.AtualizarEquipamentoRequest;
import br.com.sistema_gerencial.models.requests.CadastrarEquipamentoRequest;
import br.com.sistema_gerencial.models.response.EquipamentoResponse;
import br.com.sistema_gerencial.repositories.EquipamentoRepository;
import br.com.sistema_gerencial.services.EquipamentoService;
import lombok.RequiredArgsConstructor;

/**
 * Implementa as regras de negócio e a coordenação da persistência de equipamentos.
 */
@Service
@RequiredArgsConstructor
public class EquipamentoServiceImpl implements EquipamentoService {

	private final EquipamentoRepository repository;

	/**
	 * Executa o metodo cadastrar.
	 * @param request valor do parametro request.
	 */
	@Override
	@Transactional
	public void cadastrar(CadastrarEquipamentoRequest request) {
		repository.cadastrar(request);
	}

	/**
	 * Executa o metodo listarPorPagina.
	 * @param limit valor do parametro limit.
	 * @param page valor do parametro page.
	 * @param id_empresa valor do parametro id_empresa.
	 * @return resultado da operacao.
	 */
	@Override
	@Transactional
	public Map<String, Object> listarPorPagina(int limit, int page, int id_empresa) {
		return repository.listarPorPagina(limit, page, id_empresa);
	}

	/**
	 * Executa o metodo buscarPorId.
	 * @param id valor do parametro id.
	 * @return resultado da operacao.
	 */
	@Override
	@Transactional
	public EquipamentoResponse buscarPorId(int id) {
		return repository.buscarPorId(id);
	}

	/**
	 * Executa o metodo atualizar.
	 * @param request valor do parametro request.
	 */
	@Override
	@Transactional
	public void atualizar(AtualizarEquipamentoRequest request) {
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
}

