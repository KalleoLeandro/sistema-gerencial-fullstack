package br.com.sistema_gerencial.services.impl;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.sistema_gerencial.models.requests.AtualizarProdutoRequest;
import br.com.sistema_gerencial.models.requests.CadastrarProdutoRequest;
import br.com.sistema_gerencial.models.response.ProdutoResponse;
import br.com.sistema_gerencial.repositories.ProdutoRepository;
import br.com.sistema_gerencial.services.ProdutoService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProdutoServiceImpl implements ProdutoService {

	private final ProdutoRepository repository;

	@Override
	@Transactional
	public void cadastrar(CadastrarProdutoRequest request) {
		repository.cadastrar(request);
	}

	@Override
	@Transactional(readOnly = true)
	public Map<String, Object> listarPorPagina(int limit, int page) {
		return repository.listarPorPagina(limit, page);
	}

	@Override
	@Transactional(readOnly = true)
	public List<ProdutoResponse> listarAtivos() {
		return repository.listarAtivos();
	}

	@Override
	@Transactional(readOnly = true)
	public List<ProdutoResponse> listarEmFalta() {
		return repository.listarEmFalta();
	}

	@Override
	@Transactional(readOnly = true)
	public ProdutoResponse buscarPorId(int id) {
		return repository.buscarPorId(id);
	}

	@Override
	@Transactional
	public void atualizar(AtualizarProdutoRequest request) {
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
