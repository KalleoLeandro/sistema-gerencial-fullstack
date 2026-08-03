package br.com.sistema_gerencial.services;

import java.util.List;
import java.util.Map;

import br.com.sistema_gerencial.models.requests.AtualizarProdutoRequest;
import br.com.sistema_gerencial.models.requests.CadastrarProdutoRequest;
import br.com.sistema_gerencial.models.response.ProdutoResponse;

public interface ProdutoService {

	int cadastrar(CadastrarProdutoRequest request);

	Map<String, Object> listarPorPagina(int limit, int page);

	List<ProdutoResponse> listarAtivos();

	List<ProdutoResponse> listarEmFalta();

	ProdutoResponse buscarPorId(int id);

	void atualizar(AtualizarProdutoRequest request);

	void excluir(int id);
}
