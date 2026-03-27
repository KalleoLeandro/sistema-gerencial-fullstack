package br.com.sistema_gerencial.services;

import java.util.Map;

import br.com.sistema_gerencial.models.requests.AtualizarAgendamentoRequest;
import br.com.sistema_gerencial.models.requests.CadastrarAgendamentoRequest;
import br.com.sistema_gerencial.models.response.AgendamentoResponse;

public interface AgendamentoService {

	public void cadastrar(CadastrarAgendamentoRequest request);

	public Map<String, Object> listarPorPagina(int limit, int page);

	public AgendamentoResponse buscarPorId(int id);

	public void atualizar(AtualizarAgendamentoRequest request);

	public void excluir(int id);
}
