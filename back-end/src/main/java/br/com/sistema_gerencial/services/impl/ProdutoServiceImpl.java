package br.com.sistema_gerencial.services.impl;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.sistema_gerencial.models.requests.AtualizarProdutoRequest;
import br.com.sistema_gerencial.models.requests.CadastrarProdutoRequest;
import br.com.sistema_gerencial.models.response.ProdutoResponse;
import br.com.sistema_gerencial.repositories.ProdutoRepository;
import br.com.sistema_gerencial.services.ImagemService;
import br.com.sistema_gerencial.services.ProdutoService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProdutoServiceImpl implements ProdutoService {

	private final ProdutoRepository repository;
	private final ImagemService imagemService;

	@Override
	@Transactional
	public int cadastrar(CadastrarProdutoRequest request) {
		return repository.cadastrar(request);
	}

	@Override
	@Transactional(readOnly = true)
	public Map<String, Object> listarPorPagina(int limit, int page) {
		Map<String, Object> resultado = repository.listarPorPagina(limit, page);
		@SuppressWarnings("unchecked")
		List<ProdutoResponse> produtos = (List<ProdutoResponse>) resultado.get("lista");
		enriquecerImagemExibicao(produtos);
		return resultado;
	}

	@Override
	@Transactional(readOnly = true)
	public List<ProdutoResponse> listarAtivos() {
		List<ProdutoResponse> produtos = repository.listarAtivos();
		enriquecerImagemExibicao(produtos);
		return produtos;
	}

	@Override
	@Transactional(readOnly = true)
	public List<ProdutoResponse> listarEmFalta() {
		List<ProdutoResponse> produtos = repository.listarEmFalta();
		enriquecerImagemExibicao(produtos);
		return produtos;
	}

	@Override
	@Transactional(readOnly = true)
	public ProdutoResponse buscarPorId(int id) {
		ProdutoResponse produto = repository.buscarPorId(id);
		enriquecerImagemExibicao(List.of(produto));
		return produto;
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

	private void enriquecerImagemExibicao(List<ProdutoResponse> produtos) {
		Map<Integer, String> imagens = imagemService.buscarIdsImagemExibicaoProduto(
				produtos.stream().map(ProdutoResponse::getId).toList());
		produtos.forEach(produto -> produto.setImagem_exibicao_id(imagens.get(produto.getId())));
	}
}
