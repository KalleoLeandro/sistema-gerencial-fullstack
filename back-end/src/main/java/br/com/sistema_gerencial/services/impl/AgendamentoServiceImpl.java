package br.com.sistema_gerencial.services.impl;

import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.sistema_gerencial.models.requests.AtualizarAgendamentoRequest;
import br.com.sistema_gerencial.models.requests.CadastrarAgendamentoRequest;
import br.com.sistema_gerencial.models.response.AgendamentoResponse;
import br.com.sistema_gerencial.repositories.AgendamentoRepository;
import br.com.sistema_gerencial.services.AgendamentoService;
import lombok.RequiredArgsConstructor;

/**
 * Implementa as regras de negócio e a coordenação da persistência de agendamentos.
 */
@Service
@RequiredArgsConstructor
public class AgendamentoServiceImpl implements AgendamentoService {

	private final AgendamentoRepository repository;

	@Override
	@Transactional
	public void cadastrar(CadastrarAgendamentoRequest request) {
		repository.cadastrar(request);
	}

	@Override
	@Transactional
	public Map<String, Object> listarPorPagina(int limit, int page) {
		return repository.listarPorPagina(limit, page);
	}

	@Override
	@Transactional
	public AgendamentoResponse buscarPorId(int id) {
		return repository.buscarPorId(id);
	}

	@Override
	@Transactional
	public void atualizar(AtualizarAgendamentoRequest request) {
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
