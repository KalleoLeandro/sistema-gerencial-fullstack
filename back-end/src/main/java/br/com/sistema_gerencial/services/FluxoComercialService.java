package br.com.sistema_gerencial.services;

import br.com.sistema_gerencial.models.requests.AtualizarItensOrcamentoRequest;
import br.com.sistema_gerencial.models.requests.AtualizarVendaRequest;
import br.com.sistema_gerencial.models.requests.AprovarOrcamentoRequest;
import br.com.sistema_gerencial.models.requests.CriarOrcamentoRequest;
import br.com.sistema_gerencial.models.requests.CriarOrcamentoPdvRequest;
import br.com.sistema_gerencial.models.requests.FecharCaixaRequest;
import br.com.sistema_gerencial.models.response.CaixaFechamentoResponse;
import br.com.sistema_gerencial.models.response.CaixaResumoDiaResponse;
import br.com.sistema_gerencial.models.requests.ReabrirOrcamentoRequest;
import br.com.sistema_gerencial.models.requests.RejeitarOrcamentoRequest;
import br.com.sistema_gerencial.models.response.OrcamentoResponse;
import br.com.sistema_gerencial.models.response.VendaResponse;
import java.util.Map;

public interface FluxoComercialService {

	void gerarOrcamentoParaOrigem(String origemTipo, int origemId);

	OrcamentoResponse buscarOrcamentoPorId(int id);

	OrcamentoResponse buscarOrcamentoPorOrigem(String origemTipo, int origemId);

	Map<String, Object> listarOrcamentosPorPagina(int limit, int page, String pesquisa);

	OrcamentoResponse criarOrcamento(CriarOrcamentoRequest request);

	OrcamentoResponse criarOrcamentoPdv(CriarOrcamentoPdvRequest request);

	OrcamentoResponse atualizarItens(AtualizarItensOrcamentoRequest request);

	OrcamentoResponse rejeitarOrcamento(RejeitarOrcamentoRequest request);

	OrcamentoResponse reabrirOrcamento(ReabrirOrcamentoRequest request);

	VendaResponse aprovarOrcamento(AprovarOrcamentoRequest request);

	VendaResponse atualizarVenda(AtualizarVendaRequest request);

	VendaResponse buscarVendaPorId(int id);

	Map<String, Object> listarVendasPorPagina(int limit, int page, String pesquisa);

	CaixaResumoDiaResponse buscarResumoCaixaDia();

	CaixaFechamentoResponse fecharCaixa(FecharCaixaRequest request);
}
