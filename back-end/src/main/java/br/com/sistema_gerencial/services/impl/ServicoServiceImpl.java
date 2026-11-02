package br.com.sistema_gerencial.services.impl;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.sistema_gerencial.models.requests.AtualizarServicoRequest;
import br.com.sistema_gerencial.models.requests.CadastrarServicoRequest;
import br.com.sistema_gerencial.models.response.ServicoResponse;
import br.com.sistema_gerencial.repositories.ServicoRepository;
import br.com.sistema_gerencial.services.ServicoService;
import lombok.RequiredArgsConstructor;

/**
 * Implementa as regras de negócio e a coordenação da persistência de serviços do catálogo.
 */
@Service
@RequiredArgsConstructor
public class ServicoServiceImpl implements ServicoService {

	private final ServicoRepository repository;

	@Override
	@Transactional
	public void cadastrar(CadastrarServicoRequest request) {
		repository.cadastrar(request);
	}

	@Override
	@Transactional(readOnly = true)
	public Map<String, Object> listarPorPagina(int limit, int page) {
		return repository.listarPorPagina(limit, page);
	}

	@Override
	@Transactional(readOnly = true)
	public List<ServicoResponse> listarAtivos() {
		return repository.listarAtivos();
	}

	@Override
	@Transactional(readOnly = true)
	public ServicoResponse buscarPorId(int id) {
		return repository.buscarPorId(id);
	}

	@Override
	@Transactional
	public void atualizar(AtualizarServicoRequest request) {
		repository.buscarPorId(request.getId());
		repository.atualizar(request);
	}

	@Override
	@Transactional
	public void excluir(int id) {
		repository.buscarPorId(id);
		repository.excluir(id);
	}
}
