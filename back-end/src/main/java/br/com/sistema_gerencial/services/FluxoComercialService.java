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

/**
 * Define o contrato das operações de negócio de orçamentos, vendas, parcelas e caixa.
 */
public interface FluxoComercialService {

	/**
	 * Gera o orçamento vinculado à origem comercial informada.
	 *
	 * @param origemTipo tipo da origem comercial
	 * @param origemId identificador da origem comercial
	 */
	void gerarOrcamentoParaOrigem(String origemTipo, int origemId);

	/**
	 * Consulta um orçamento e seus itens pelo identificador.
	 *
	 * @param id identificador do registro
	 * @return detalhes do orçamento
	 */
	OrcamentoResponse buscarOrcamentoPorId(int id);

	/**
	 * Consulta o orçamento vinculado a uma origem comercial.
	 *
	 * @param origemTipo tipo da origem comercial
	 * @param origemId identificador da origem comercial
	 * @return orçamento associado à origem
	 */
	OrcamentoResponse buscarOrcamentoPorOrigem(String origemTipo, int origemId);

	/**
	 * Pesquisa os orçamentos com paginação.
	 *
	 * @param limit quantidade máxima de registros por página
	 * @param page número da página solicitada
	 * @param pesquisa termo utilizado para filtrar a listagem
	 * @return orçamentos da página e metadados da consulta
	 */
	Map<String, Object> listarOrcamentosPorPagina(int limit, int page, String pesquisa);

	/**
	 * Cria um orçamento vinculado à origem comercial.
	 *
	 * @param request dados da operação
	 * @return orçamento criado
	 */
	OrcamentoResponse criarOrcamento(CriarOrcamentoRequest request);

	/**
	 * Cria um orçamento com os itens informados no ponto de venda.
	 *
	 * @param request dados da operação
	 * @return orçamento criado no ponto de venda
	 */
	OrcamentoResponse criarOrcamentoPdv(CriarOrcamentoPdvRequest request);

	/**
	 * Atualiza os itens e recalcula os valores de um orçamento.
	 *
	 * @param request dados da operação
	 * @return orçamento com os itens atualizados
	 */
	OrcamentoResponse atualizarItens(AtualizarItensOrcamentoRequest request);

	/**
	 * Rejeita o orçamento e registra o motivo informado.
	 *
	 * @param request dados da operação
	 * @return orçamento rejeitado
	 */
	OrcamentoResponse rejeitarOrcamento(RejeitarOrcamentoRequest request);

	/**
	 * Reabre o orçamento conforme as regras de transição de estado.
	 *
	 * @param request dados da operação
	 * @return orçamento reaberto
	 */
	OrcamentoResponse reabrirOrcamento(ReabrirOrcamentoRequest request);

	/**
	 * Aprova o orçamento e registra a venda e suas condições de pagamento.
	 *
	 * @param request dados da operação
	 * @return venda gerada pela aprovação
	 */
	VendaResponse aprovarOrcamento(AprovarOrcamentoRequest request);

	/**
	 * Atualiza uma venda conforme as regras de alteração do fluxo comercial.
	 *
	 * @param request dados da operação
	 * @return venda atualizada
	 */
	VendaResponse atualizarVenda(AtualizarVendaRequest request);

	/**
	 * Consulta os detalhes, parcelas e pagamentos de uma venda.
	 *
	 * @param id identificador do registro
	 * @return detalhes da venda
	 */
	VendaResponse buscarVendaPorId(int id);

	/**
	 * Pesquisa as vendas com paginação.
	 *
	 * @param limit quantidade máxima de registros por página
	 * @param page número da página solicitada
	 * @param pesquisa termo utilizado para filtrar a listagem
	 * @return vendas da página e metadados da consulta
	 */
	Map<String, Object> listarVendasPorPagina(int limit, int page, String pesquisa);

	/**
	 * Consolida os pagamentos e fechamentos do caixa do dia de negócio.
	 *
	 * @return resumo diário do caixa
	 */
	CaixaResumoDiaResponse buscarResumoCaixaDia();

	/**
	 * Registra a conferência e o fechamento do caixa na data informada.
	 *
	 * @param request dados da operação
	 * @return fechamento com valores apurados e diferenças de conferência
	 */
	CaixaFechamentoResponse fecharCaixa(FecharCaixaRequest request);
}
