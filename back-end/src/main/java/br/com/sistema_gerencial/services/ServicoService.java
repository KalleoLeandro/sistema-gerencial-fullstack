package br.com.sistema_gerencial.services;

import java.util.List;
import java.util.Map;

import br.com.sistema_gerencial.models.requests.AtualizarServicoRequest;
import br.com.sistema_gerencial.models.requests.CadastrarServicoRequest;
import br.com.sistema_gerencial.models.response.ServicoResponse;

public interface ServicoService {

	void cadastrar(CadastrarServicoRequest request);

	Map<String, Object> listarPorPagina(int limit, int page);

	List<ServicoResponse> listarAtivos();

	ServicoResponse buscarPorId(int id);

	void atualizar(AtualizarServicoRequest request);

	void excluir(int id);
}
