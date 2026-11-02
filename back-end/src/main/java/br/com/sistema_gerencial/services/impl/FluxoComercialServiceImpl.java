package br.com.sistema_gerencial.services.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.sistema_gerencial.exceptions.DefaultErrorException;
import br.com.sistema_gerencial.models.dto.OrigemComercialDTO;
import br.com.sistema_gerencial.models.requests.AtualizarItensOrcamentoRequest;
import br.com.sistema_gerencial.models.requests.AtualizarVendaRequest;
import br.com.sistema_gerencial.models.requests.AprovarOrcamentoRequest;
import br.com.sistema_gerencial.models.requests.CriarOrcamentoRequest;
import br.com.sistema_gerencial.models.requests.CriarOrcamentoPdvRequest;
import br.com.sistema_gerencial.models.requests.FecharCaixaItemRequest;
import br.com.sistema_gerencial.models.requests.FecharCaixaRequest;
import br.com.sistema_gerencial.models.requests.OrcamentoItemRequest;
import br.com.sistema_gerencial.models.requests.PagamentoVendaRequest;
import br.com.sistema_gerencial.models.requests.ReabrirOrcamentoRequest;
import br.com.sistema_gerencial.models.requests.RejeitarOrcamentoRequest;
import br.com.sistema_gerencial.models.response.CaixaFechamentoResponse;
import br.com.sistema_gerencial.models.response.CaixaResumoDiaResponse;
import br.com.sistema_gerencial.models.response.CaixaResumoPagamentoResponse;
import br.com.sistema_gerencial.models.response.OrcamentoItemResponse;
import br.com.sistema_gerencial.models.response.OrcamentoResponse;
import br.com.sistema_gerencial.models.response.ParcelaResponse;
import br.com.sistema_gerencial.models.response.VendaResponse;
import br.com.sistema_gerencial.repositories.FluxoComercialRepository;
import br.com.sistema_gerencial.services.FluxoComercialService;
import org.springframework.beans.factory.annotation.Autowired;
import java.time.Clock;
import java.time.ZoneId;

/**
 * Implementa as regras de negócio e a coordenação da persistência de orçamentos, vendas, parcelas e caixa.
 */
@Service
public class FluxoComercialServiceImpl implements FluxoComercialService {

	private static final BigDecimal ZERO = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
	private static final BigDecimal ZERO_QUANTIDADE = BigDecimal.ZERO.setScale(3, RoundingMode.HALF_UP);

	private final FluxoComercialRepository repository;
    private final Clock clock;

    @Autowired
    public FluxoComercialServiceImpl(FluxoComercialRepository repository, Clock clock) {
        this.repository=repository;
        this.clock=clock;
    }

    public FluxoComercialServiceImpl(FluxoComercialRepository repository) {
        this(repository,Clock.system(ZoneId.of("America/Sao_Paulo")));
    }


	@Override
	@Transactional
	public void gerarOrcamentoParaOrigem(String origemTipo, int origemId) {
		Integer orcamentoExistente = repository.buscarIdOrcamentoPorOrigem(origemTipo, origemId);
		if (orcamentoExistente != null) {
			return;
		}

		OrigemComercialDTO origem = repository.buscarOrigem(origemTipo, origemId);
		int idOrcamento = repository.inserirOrcamento(null, origem,
				"Orcamento gerado automaticamente a partir de " + origem.getOrigemTipo().toLowerCase() + ".");

		Map<String, Object> payload = new LinkedHashMap<>();
		payload.put("orcamentoId", idOrcamento);
		payload.put("codigo", null);
		payload.put("origemTipo", origem.getOrigemTipo());
		payload.put("origemId", origem.getOrigemId());
		payload.put("clienteNome", origem.getClienteNome());
		payload.put("clienteDocumento", origem.getClienteDocumento());
		repository.registrarEventoOutbox("ORCAMENTO", idOrcamento, "ORCAMENTO_GERADO", payload);
	}

	@Override
	@Transactional(readOnly = true)
	public OrcamentoResponse buscarOrcamentoPorId(int id) {
		return repository.buscarOrcamentoPorId(id);
	}

	@Override
	@Transactional(readOnly = true)
	public OrcamentoResponse buscarOrcamentoPorOrigem(String origemTipo, int origemId) {
		return repository.buscarOrcamentoPorOrigem(origemTipo, origemId);
	}

	@Override
	@Transactional(readOnly = true)
	public Map<String, Object> listarOrcamentosPorPagina(int limit, int page, String pesquisa) {
		return repository.listarOrcamentosPorPagina(normalizarLimite(limit), normalizarPagina(page), pesquisa);
	}

	@Override
	@Transactional
	public OrcamentoResponse criarOrcamento(CriarOrcamentoRequest request) {
		CriarOrcamentoRequest requestNormalizado = request == null ? new CriarOrcamentoRequest() : request;
		String origemTipo = blankToNull(requestNormalizado.getOrigem_tipo());
		int origemId = origemTipo == null ? 0 : Math.max(0, requestNormalizado.getOrigem_id() == null ? 0 : requestNormalizado.getOrigem_id());

		OrigemComercialDTO origem = origemTipo == null
				? OrigemComercialDTO.builder()
						.origemId(0)
						.origemTipo("LIVRE")
						.clienteNome(blankToNull(requestNormalizado.getCliente_nome()) != null
								? requestNormalizado.getCliente_nome().trim()
								: "Consumidor final")
						.clienteDocumento(blankToNull(requestNormalizado.getCliente_documento()))
						.observacoes(blankToNull(requestNormalizado.getObservacoes()))
						.build()
				: repository.buscarOrigem(origemTipo, origemId);

		int idOrcamento = repository.inserirOrcamento(null, origem,
				blankToNull(requestNormalizado.getObservacoes()) != null
						? requestNormalizado.getObservacoes().trim()
						: origemTipo == null
								? "Orcamento criado manualmente."
								: "Orcamento criado manualmente a partir de " + origem.getOrigemTipo().toLowerCase() + ".");

		Map<String, Object> payload = new LinkedHashMap<>();
		payload.put("orcamentoId", idOrcamento);
		payload.put("codigo", null);
		payload.put("origemTipo", origem.getOrigemTipo());
		payload.put("origemId", origem.getOrigemId() == 0 ? null : origem.getOrigemId());
		payload.put("clienteNome", origem.getClienteNome());
		payload.put("clienteDocumento", origem.getClienteDocumento());
		repository.registrarEventoOutbox("ORCAMENTO", idOrcamento, "ORCAMENTO_GERADO", payload);

		return repository.buscarOrcamentoPorId(idOrcamento);
	}

	@Override
	@Transactional
	public OrcamentoResponse criarOrcamentoPdv(CriarOrcamentoPdvRequest request) {
		CriarOrcamentoPdvRequest requestNormalizado = request == null ? new CriarOrcamentoPdvRequest() : request;
		OrigemComercialDTO origem = OrigemComercialDTO.builder()
				.origemId(0)
				.origemTipo("PDV")
				.clienteNome(blankToNull(requestNormalizado.getCliente_nome()) != null
						? requestNormalizado.getCliente_nome().trim()
						: "Consumidor final")
				.clienteDocumento(blankToNull(requestNormalizado.getCliente_documento()))
				.observacoes(blankToNull(requestNormalizado.getObservacoes()))
				.build();

		int idOrcamento = repository.inserirOrcamento(null, origem,
				blankToNull(requestNormalizado.getObservacoes()) != null
						? requestNormalizado.getObservacoes().trim()
						: "Orcamento gerado para venda direta PDV.");

		Map<String, Object> payload = new LinkedHashMap<>();
		payload.put("orcamentoId", idOrcamento);
		payload.put("codigo", null);
		payload.put("origemTipo", "PDV");
		payload.put("clienteNome", origem.getClienteNome());
		repository.registrarEventoOutbox("ORCAMENTO", idOrcamento, "ORCAMENTO_GERADO", payload);

		return repository.buscarOrcamentoPorId(idOrcamento);
	}

	@Override
	@Transactional
	public OrcamentoResponse atualizarItens(AtualizarItensOrcamentoRequest request) {
		OrcamentoResponse orcamento = repository.buscarOrcamentoPorId(request.getId_orcamento());
		validarOrcamentoEditavel(orcamento);

		List<OrcamentoItemResponse> itensNormalizados = normalizarItens(request.getItens());
		BigDecimal subtotal = itensNormalizados.stream()
				.map(OrcamentoItemResponse::getValor_total)
				.reduce(ZERO, BigDecimal::add)
				.setScale(2, RoundingMode.HALF_UP);
		BigDecimal descontoItens = itensNormalizados.stream()
				.map(OrcamentoItemResponse::getValor_desconto)
				.reduce(ZERO, BigDecimal::add)
				.setScale(2, RoundingMode.HALF_UP);
		BigDecimal descontoFinanceiro = monetary(request.getDesconto_financeiro());
		BigDecimal acrescimoFinanceiro = monetary(request.getAcrescimo_financeiro());
		BigDecimal totalDesconto = descontoItens.add(descontoFinanceiro).setScale(2, RoundingMode.HALF_UP);
		BigDecimal totalAcrescimo = acrescimoFinanceiro.setScale(2, RoundingMode.HALF_UP);
		BigDecimal totalGeral = subtotal.subtract(descontoFinanceiro).add(acrescimoFinanceiro).setScale(2, RoundingMode.HALF_UP);

		if (totalGeral.compareTo(ZERO) < 0) {
			throw new DefaultErrorException("O total do orcamento nao pode ser negativo.", HttpStatus.BAD_REQUEST);
		}

		repository.removerItensOrcamento(request.getId_orcamento());
		for (OrcamentoItemResponse item : itensNormalizados) {
			repository.inserirItemOrcamento(request.getId_orcamento(), item);
		}

		if (blankToNull(orcamento.getCodigo()) == null && !itensNormalizados.isEmpty()) {
			String prefixo = "PDV".equalsIgnoreCase(orcamento.getOrigem_tipo()) ? "PDV" : "ORC";
			repository.atualizarCodigoOrcamento(orcamento.getId(), gerarCodigoSequencial(prefixo, orcamento.getId()));
		}

		String status = itensNormalizados.isEmpty() ? "ABERTO" : "EM_ANALISE";
		repository.atualizarResumoOrcamento(request.getId_orcamento(), request.getValidade_em(), descontoFinanceiro,
				acrescimoFinanceiro, blankToNull(request.getCliente_nome()), blankToNull(request.getCliente_documento()),
				subtotal, totalDesconto, totalAcrescimo, totalGeral, status,
				blankToNull(request.getObservacoes()));
		atualizarOrigemComValorOrcamento(orcamento, totalGeral);

		Integer idVendaExistente = repository.buscarVendaPorOrcamento(request.getId_orcamento());
		if (idVendaExistente != null) {
			repository.removerItensVenda(idVendaExistente);
			for (OrcamentoItemResponse item : itensNormalizados) {
				repository.inserirItemVenda(idVendaExistente, item);
			}
			repository.atualizarResumoVenda(idVendaExistente,
					blankToNull(request.getCliente_nome()) != null ? request.getCliente_nome().trim() : orcamento.getCliente_nome(),
					blankToNull(request.getCliente_documento()),
					subtotal, totalDesconto, totalAcrescimo, totalGeral,
					blankToNull(request.getObservacoes()));
		}

		Map<String, Object> payload = new LinkedHashMap<>();
		payload.put("orcamentoId", request.getId_orcamento());
		payload.put("status", status);
		payload.put("subtotal", subtotal);
		payload.put("totalDesconto", totalDesconto);
		payload.put("totalAcrescimo", totalAcrescimo);
		payload.put("totalGeral", totalGeral);
		payload.put("quantidadeItens", itensNormalizados.size());
		repository.registrarEventoOutbox("ORCAMENTO", request.getId_orcamento(), "ORCAMENTO_ATUALIZADO", payload);

		return repository.buscarOrcamentoPorId(request.getId_orcamento());
	}

	@Override
	@Transactional
	public VendaResponse aprovarOrcamento(AprovarOrcamentoRequest request) {
		OrcamentoResponse orcamento = repository.buscarOrcamentoPorId(request.getId_orcamento());
		if (orcamento.getItens() == null || orcamento.getItens().isEmpty()) {
			throw new DefaultErrorException("O orcamento precisa ter ao menos um item para ser aprovado.",
					HttpStatus.BAD_REQUEST);
		}
		if ("APROVADO".equalsIgnoreCase(orcamento.getStatus())) {
			Integer idVendaExistente = repository.buscarVendaPorOrcamento(orcamento.getId());
			if (idVendaExistente != null) {
				return repository.buscarVendaPorId(idVendaExistente);
			}
			throw new DefaultErrorException("O orcamento ja foi aprovado.", HttpStatus.BAD_REQUEST);
		}
		if ("REJEITADO".equalsIgnoreCase(orcamento.getStatus())) {
			throw new DefaultErrorException("Orcamentos rejeitados nao podem ser aprovados.", HttpStatus.BAD_REQUEST);
		}

		int quantidadeParcelas = request.getQuantidade_parcelas() == null || request.getQuantidade_parcelas() < 1
				? 1
				: request.getQuantidade_parcelas();
		if (repository.buscarVendaPorOrcamento(orcamento.getId()) != null) {
			throw new DefaultErrorException("Ja existe venda gerada para este orcamento.", HttpStatus.BAD_REQUEST);
		}

		String codigoVenda = gerarCodigo("VEN", orcamento.getId());
		int idVenda = repository.inserirVenda(codigoVenda, orcamento, blankToNull(request.getForma_pagamento()),
				quantidadeParcelas, blankToNull(request.getObservacoes()));
		for (OrcamentoItemResponse item : orcamento.getItens()) {
			repository.inserirItemVenda(idVenda, item);
		}

		LocalDate primeiroVencimento = request.getData_primeiro_vencimento() != null
				? request.getData_primeiro_vencimento()
				: LocalDate.now(clock);
		int intervaloDias = request.getIntervalo_dias() == null || request.getIntervalo_dias() < 1
				? 30
				: request.getIntervalo_dias();

		List<BigDecimal> valoresParcelas = quebrarParcelas(orcamento.getTotal_geral(), quantidadeParcelas);
		for (int i = 0; i < valoresParcelas.size(); i++) {
			repository.inserirParcela(idVenda, i + 1, primeiroVencimento.plusDays((long) i * intervaloDias), valoresParcelas.get(i));
		}

		repository.aprovarOrcamento(orcamento.getId(), LocalDateTime.now(clock));

		Map<String, Object> payloadOrcamento = new LinkedHashMap<>();
		payloadOrcamento.put("orcamentoId", orcamento.getId());
		payloadOrcamento.put("status", "APROVADO");
		payloadOrcamento.put("vendaId", idVenda);
		payloadOrcamento.put("totalGeral", orcamento.getTotal_geral());
		repository.registrarEventoOutbox("ORCAMENTO", orcamento.getId(), "ORCAMENTO_APROVADO", payloadOrcamento);

		Map<String, Object> payloadVenda = new LinkedHashMap<>();
		payloadVenda.put("vendaId", idVenda);
		payloadVenda.put("orcamentoId", orcamento.getId());
		payloadVenda.put("codigo", codigoVenda);
		payloadVenda.put("clienteNome", orcamento.getCliente_nome());
		payloadVenda.put("quantidadeParcelas", quantidadeParcelas);
		payloadVenda.put("totalGeral", orcamento.getTotal_geral());
		repository.registrarEventoOutbox("VENDA", idVenda, "VENDA_GERADA", payloadVenda);

		if (request.getPagamentos() != null) {
			for (PagamentoVendaRequest pagamento : request.getPagamentos()) {
				registrarPagamento(idVenda, pagamento);
			}
		}

		return repository.buscarVendaPorId(idVenda);
	}

	@Override
	@Transactional
	public OrcamentoResponse rejeitarOrcamento(RejeitarOrcamentoRequest request) {
		OrcamentoResponse orcamento = repository.buscarOrcamentoPorId(request.getId_orcamento());
		if ("APROVADO".equalsIgnoreCase(orcamento.getStatus())) {
			throw new DefaultErrorException("Orcamentos aprovados nao podem ser rejeitados.", HttpStatus.BAD_REQUEST);
		}
		if ("REJEITADO".equalsIgnoreCase(orcamento.getStatus())) {
			return orcamento;
		}

		String motivoRejeicao = blankToNull(request.getMotivo()) != null
				? request.getMotivo().trim()
				: "Orcamento rejeitado.";
		String observacoesAtualizadas = appendObservacao(orcamento.getObservacoes(), "Orcamento rejeitado. Motivo: " + motivoRejeicao);

		repository.rejeitarOrcamento(orcamento.getId(), observacoesAtualizadas);
		atualizarOrigemComValorOrcamento(orcamento, ZERO);

		if (orcamento.getId_manutencao() != null) {
			repository.cancelarManutencao(orcamento.getId_manutencao(), motivoRejeicao,
					appendObservacao(observacoesAtualizadas, "Cancelado automaticamente apos rejeicao do orcamento."));
		}
		if (orcamento.getId_avulso() != null) {
			repository.cancelarAvulso(orcamento.getId_avulso(), motivoRejeicao,
					appendObservacao(observacoesAtualizadas, "Cancelado automaticamente apos rejeicao do orcamento."));
		}

		Map<String, Object> payload = new LinkedHashMap<>();
		payload.put("orcamentoId", orcamento.getId());
		payload.put("status", "REJEITADO");
		payload.put("motivo", motivoRejeicao);
		payload.put("origemTipo", orcamento.getOrigem_tipo());
		payload.put("origemId", orcamento.getId_atendimento() != null
				? orcamento.getId_atendimento()
				: orcamento.getId_manutencao() != null
						? orcamento.getId_manutencao()
						: orcamento.getId_avulso());
		repository.registrarEventoOutbox("ORCAMENTO", orcamento.getId(), "ORCAMENTO_REJEITADO", payload);

		return repository.buscarOrcamentoPorId(orcamento.getId());
	}

	@Override
	@Transactional
	public OrcamentoResponse reabrirOrcamento(ReabrirOrcamentoRequest request) {
		OrcamentoResponse orcamento = repository.buscarOrcamentoPorId(request.getId_orcamento());
		if (!"REJEITADO".equalsIgnoreCase(orcamento.getStatus())) {
			return orcamento;
		}
		if (orcamento.getId_atendimento() == null) {
			throw new DefaultErrorException("Somente orcamentos de atendimento podem ser reabertos.",
					HttpStatus.BAD_REQUEST);
		}

		String statusReaberto = (orcamento.getItens() == null || orcamento.getItens().isEmpty()) ? "ABERTO" : "EM_ANALISE";
		String observacoesAtualizadas = appendObservacao(orcamento.getObservacoes(), "Orcamento reaberto para atendimento.");
		repository.reabrirOrcamento(orcamento.getId(), statusReaberto, observacoesAtualizadas);
		atualizarOrigemComValorOrcamento(orcamento, monetary(orcamento.getTotal_geral()));

		Map<String, Object> payload = new LinkedHashMap<>();
		payload.put("orcamentoId", orcamento.getId());
		payload.put("status", statusReaberto);
		payload.put("origemTipo", orcamento.getOrigem_tipo());
		payload.put("origemId", orcamento.getId_atendimento());
		repository.registrarEventoOutbox("ORCAMENTO", orcamento.getId(), "ORCAMENTO_REABERTO", payload);

		return repository.buscarOrcamentoPorId(orcamento.getId());
	}

	@Override
	@Transactional(readOnly = true)
	public VendaResponse buscarVendaPorId(int id) {
		return repository.buscarVendaPorId(id);
	}

	@Override
	@Transactional
	public VendaResponse atualizarVenda(AtualizarVendaRequest request) {
		VendaResponse venda = repository.buscarVendaPorId(request.getId_venda());

		List<OrcamentoItemResponse> itensNormalizados = normalizarItens(request.getItens());
		BigDecimal subtotal = itensNormalizados.stream()
				.map(OrcamentoItemResponse::getValor_total)
				.reduce(ZERO, BigDecimal::add)
				.setScale(2, RoundingMode.HALF_UP);
		BigDecimal descontoItens = itensNormalizados.stream()
				.map(OrcamentoItemResponse::getValor_desconto)
				.reduce(ZERO, BigDecimal::add)
				.setScale(2, RoundingMode.HALF_UP);
		BigDecimal totalDesconto = descontoItens.setScale(2, RoundingMode.HALF_UP);
		BigDecimal totalAcrescimo = ZERO;
		BigDecimal totalGeral = subtotal.setScale(2, RoundingMode.HALF_UP);

		if (totalGeral.compareTo(ZERO) < 0) {
			throw new DefaultErrorException("O total da venda nao pode ser negativo.", HttpStatus.BAD_REQUEST);
		}

		repository.removerItensVenda(venda.getId());
		for (OrcamentoItemResponse item : itensNormalizados) {
			repository.inserirItemVenda(venda.getId(), item);
		}

		List<PagamentoVendaRequest> pagamentos = request.getPagamentos() == null ? List.of() : request.getPagamentos();
		BigDecimal totalPagoInformado = pagamentos.stream()
				.map(PagamentoVendaRequest::getValor_pago)
				.map(this::monetary)
				.reduce(ZERO, BigDecimal::add)
				.setScale(2, RoundingMode.HALF_UP);
		if (totalPagoInformado.compareTo(totalGeral) != 0) {
			throw new DefaultErrorException("O total pago informado deve ser igual ao total da venda.", HttpStatus.BAD_REQUEST);
		}

		repository.atualizarVenda(venda.getId(),
				blankToNull(request.getCliente_nome()) != null ? request.getCliente_nome().trim() : venda.getCliente_nome(),
				blankToNull(request.getCliente_documento()),
				normalizarFormaPagamento(blankToNull(request.getForma_pagamento())),
				1,
				subtotal,
				totalDesconto,
				totalAcrescimo,
				totalGeral,
				blankToNull(request.getObservacoes()));

		repository.removerPagamentosVenda(venda.getId());
		repository.removerParcelasVenda(venda.getId());
		repository.inserirParcela(venda.getId(), 1, LocalDate.now(clock), totalGeral);
		for (PagamentoVendaRequest pagamento : pagamentos) {
			PagamentoVendaRequest pagamentoNormalizado = new PagamentoVendaRequest();
			pagamentoNormalizado.setNumero_parcela(1);
			pagamentoNormalizado.setData_pagamento(pagamento.getData_pagamento());
			pagamentoNormalizado.setForma_pagamento(pagamento.getForma_pagamento());
			pagamentoNormalizado.setValor_pago(pagamento.getValor_pago());
			pagamentoNormalizado.setValor_entregue(pagamento.getValor_entregue());
			pagamentoNormalizado.setObservacoes(pagamento.getObservacoes());
			registrarPagamento(venda.getId(), pagamentoNormalizado);
		}

		return repository.buscarVendaPorId(venda.getId());
	}

	@Override
	@Transactional(readOnly = true)
	public Map<String, Object> listarVendasPorPagina(int limit, int page, String pesquisa) {
		return repository.listarVendasPorPagina(normalizarLimite(limit), normalizarPagina(page), pesquisa);
	}

	@Override
	@Transactional(readOnly = true)
	public CaixaResumoDiaResponse buscarResumoCaixaDia() {
		LocalDate hoje = LocalDate.now(clock);
		return CaixaResumoDiaResponse.builder()
				.data_referencia(hoje)
				.resumo(repository.listarResumoCaixaDia(hoje))
				.fechamentos(repository.listarFechamentosCaixa())
				.build();
	}

	@Override
	@Transactional
	public CaixaFechamentoResponse fecharCaixa(FecharCaixaRequest request) {
		FecharCaixaRequest requestNormalizado = request == null ? new FecharCaixaRequest() : request;
		LocalDate dataReferencia = requestNormalizado.getData_referencia() == null
				? LocalDate.now(clock)
				: requestNormalizado.getData_referencia();
		List<CaixaResumoPagamentoResponse> resumoEsperado = repository.listarResumoCaixaDia(dataReferencia);
		BigDecimal valorEsperado = resumoEsperado.stream()
				.map(item -> monetary(item.getValor_recebido()))
				.reduce(ZERO, BigDecimal::add)
				.setScale(2, RoundingMode.HALF_UP);
		List<CaixaResumoPagamentoResponse> resumoConferido = normalizarItensFechamentoCaixa(
				requestNormalizado.getItens(),
				resumoEsperado);
		BigDecimal valorInformado = resumoConferido.stream()
				.map(item -> monetary(item.getValor_recebido()))
				.reduce(ZERO, BigDecimal::add)
				.setScale(2, RoundingMode.HALF_UP);
		if ((requestNormalizado.getItens() == null || requestNormalizado.getItens().isEmpty())
				&& requestNormalizado.getValor_informado() != null) {
			valorInformado = monetary(requestNormalizado.getValor_informado());
		}
		if (valorInformado.compareTo(ZERO) < 0) {
			throw new DefaultErrorException("Valor conferido nao pode ser negativo.", HttpStatus.BAD_REQUEST);
		}
		BigDecimal valorQuebra = valorInformado.subtract(valorEsperado).setScale(2, RoundingMode.HALF_UP);

		CaixaFechamentoResponse fechamento = repository.salvarFechamentoCaixa(dataReferencia, valorEsperado,
				valorInformado, valorQuebra, blankToNull(requestNormalizado.getObservacoes()));
		repository.substituirItensFechamentoCaixa(fechamento.getId(), resumoConferido);
		fechamento.setItens(repository.listarItensFechamentoCaixa(fechamento.getId()));
		return fechamento;
	}

	private List<CaixaResumoPagamentoResponse> normalizarItensFechamentoCaixa(
			List<FecharCaixaItemRequest> itensRequest,
			List<CaixaResumoPagamentoResponse> resumoEsperado) {
		Map<String, CaixaResumoPagamentoResponse> itensNormalizados = new LinkedHashMap<>();

		for (CaixaResumoPagamentoResponse item : resumoEsperado) {
			String formaPagamento = blankToNull(item.getForma_pagamento()) == null
					? "NAO INFORMADO"
					: item.getForma_pagamento().trim().toUpperCase();
			itensNormalizados.put(formaPagamento, CaixaResumoPagamentoResponse.builder()
					.forma_pagamento(formaPagamento)
					.valor_total(monetary(item.getValor_total()))
					.valor_recebido(monetary(item.getValor_recebido()))
						.valor_entregue(item.getValor_entregue()).troco(item.getTroco())
					.build());
		}

		if (itensRequest != null && !itensRequest.isEmpty()) {
			for (FecharCaixaItemRequest itemRequest : itensRequest) {
				if (itemRequest == null) {
					continue;
				}
				String formaPagamento = blankToNull(itemRequest.getForma_pagamento()) == null
						? "NAO INFORMADO"
						: itemRequest.getForma_pagamento().trim().toUpperCase();
				BigDecimal valorInformado = monetary(itemRequest.getValor_informado());
				if (valorInformado.compareTo(ZERO) < 0) {
					throw new DefaultErrorException("Valor conferido por forma de pagamento nao pode ser negativo.",
							HttpStatus.BAD_REQUEST);
				}
				CaixaResumoPagamentoResponse atual = itensNormalizados.get(formaPagamento);
				itensNormalizados.put(formaPagamento, CaixaResumoPagamentoResponse.builder()
						.forma_pagamento(formaPagamento)
						.valor_total(atual != null ? monetary(atual.getValor_total()) : ZERO)
						.valor_recebido(valorInformado)
						.valor_entregue(atual != null ? atual.getValor_entregue() : null).troco(atual != null ? atual.getTroco() : null)
						.build());
			}
		}

		return new ArrayList<>(itensNormalizados.values());
	}

	private void registrarPagamento(int idVenda, PagamentoVendaRequest pagamentoRequest) {
		int numeroParcela = pagamentoRequest.getNumero_parcela() == null ? 1 : pagamentoRequest.getNumero_parcela();
		ParcelaResponse parcela = repository.buscarParcelaPorNumero(idVenda, numeroParcela);
		BigDecimal valorPago = monetary(pagamentoRequest.getValor_pago());
		if (valorPago.compareTo(ZERO) <= 0) {
			throw new DefaultErrorException("Pagamento deve ser maior que zero.", HttpStatus.BAD_REQUEST);
		}
		BigDecimal novoValorPago = monetary(parcela.getValor_pago()).add(valorPago).setScale(2, RoundingMode.HALF_UP);
		BigDecimal novoSaldo = monetary(parcela.getValor_previsto()).subtract(novoValorPago).setScale(2, RoundingMode.HALF_UP);
		if (novoSaldo.compareTo(ZERO) < 0) {
			throw new DefaultErrorException("Pagamento excede o saldo aberto da parcela.", HttpStatus.BAD_REQUEST);
		}
		LocalDateTime dataPagamento = pagamentoRequest.getData_pagamento() != null
				? pagamentoRequest.getData_pagamento()
				: LocalDateTime.now(clock);
		String status = novoSaldo.compareTo(ZERO) == 0 ? "PAGA" : "PARCIAL";

		BigDecimal valorEntregue = pagamentoRequest.getValor_entregue() == null ? valorPago : monetary(pagamentoRequest.getValor_entregue());
        BigDecimal troco = valorEntregue.subtract(valorPago).setScale(2, RoundingMode.HALF_UP);
        if (troco.signum() < 0) throw new DefaultErrorException("Valor entregue não pode ser menor que o pagamento.", HttpStatus.BAD_REQUEST);
        if (troco.signum() > 0 && !"DINHEIRO".equalsIgnoreCase(pagamentoRequest.getForma_pagamento()))
            throw new DefaultErrorException("Troco é permitido apenas para pagamento em dinheiro.", HttpStatus.BAD_REQUEST);
        String codigoPagamento = gerarCodigo("PAG", parcela.getId());
		repository.inserirPagamento(parcela.getId(), codigoPagamento, dataPagamento,
				blankToNull(pagamentoRequest.getForma_pagamento()), valorPago, blankToNull(pagamentoRequest.getObservacoes()),
				valorEntregue, troco);
		repository.atualizarParcelaAposPagamento(parcela.getId(), novoValorPago, novoSaldo, status, dataPagamento);

		Map<String, Object> payloadPagamento = new LinkedHashMap<>();
		payloadPagamento.put("vendaId", idVenda);
		payloadPagamento.put("parcelaId", parcela.getId());
		payloadPagamento.put("numeroParcela", parcela.getNumero_parcela());
		payloadPagamento.put("valorPago", valorPago);
		payloadPagamento.put("valorEntregue", valorEntregue);
		payloadPagamento.put("troco", troco);
		payloadPagamento.put("saldoAberto", novoSaldo);
		payloadPagamento.put("statusParcela", status);
		repository.registrarEventoOutbox("PAGAMENTO", parcela.getId(), "PAGAMENTO_REGISTRADO", payloadPagamento);
	}

	private void atualizarOrigemComValorOrcamento(OrcamentoResponse orcamento, BigDecimal totalGeral) {
		if (orcamento.getId_atendimento() != null) {
			repository.atualizarValorOrcamentoNaOrigem("ATENDIMENTO", orcamento.getId_atendimento(), totalGeral);
			return;
		}
		if (orcamento.getId_manutencao() != null) {
			repository.atualizarValorOrcamentoNaOrigem("MANUTENCAO", orcamento.getId_manutencao(), totalGeral);
			return;
		}
		if (orcamento.getId_avulso() != null) {
			repository.atualizarValorOrcamentoNaOrigem("AVULSO", orcamento.getId_avulso(), totalGeral);
		}
	}

	private void validarOrcamentoEditavel(OrcamentoResponse orcamento) {
		if ("REJEITADO".equalsIgnoreCase(orcamento.getStatus())) {
			throw new DefaultErrorException("Orcamentos rejeitados nao podem ser alterados.", HttpStatus.BAD_REQUEST);
		}
	}

	private List<OrcamentoItemResponse> normalizarItens(List<OrcamentoItemRequest> itens) {
		List<OrcamentoItemResponse> resultado = new ArrayList<>();
		if (itens == null) {
			return resultado;
		}

		for (int index = 0; index < itens.size(); index++) {
			OrcamentoItemRequest item = itens.get(index);
			if (item == null) {
				continue;
			}
			if (blankToNull(item.getDescricao()) == null) {
				throw new DefaultErrorException("Descricao do item e obrigatoria.", HttpStatus.BAD_REQUEST);
			}
			String tipoItem = blankToNull(item.getTipo_item());
			if (tipoItem == null) {
				throw new DefaultErrorException("Tipo do item e obrigatorio.", HttpStatus.BAD_REQUEST);
			}

			BigDecimal quantidade = quantity(item.getQuantidade());
			if (quantidade.compareTo(ZERO_QUANTIDADE) <= 0) {
				throw new DefaultErrorException("Quantidade do item deve ser maior que zero.", HttpStatus.BAD_REQUEST);
			}
			BigDecimal valorUnitario = monetary(item.getValor_unitario());
			if (valorUnitario.compareTo(ZERO) < 0) {
				throw new DefaultErrorException("Valor unitario invalido.", HttpStatus.BAD_REQUEST);
			}
			BigDecimal percentualDesconto = percentage(item.getPercentual_desconto());
			BigDecimal valorBruto = quantidade.multiply(valorUnitario).setScale(2, RoundingMode.HALF_UP);
			BigDecimal valorDesconto = monetary(item.getValor_desconto());
			if (percentualDesconto.compareTo(ZERO) > 0 && valorDesconto.compareTo(ZERO) == 0) {
				valorDesconto = valorBruto.multiply(percentualDesconto)
						.divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
			}
			if (valorDesconto.compareTo(valorBruto) > 0) {
				throw new DefaultErrorException("Desconto do item nao pode exceder o valor bruto.", HttpStatus.BAD_REQUEST);
			}
			BigDecimal valorTotal = valorBruto.subtract(valorDesconto).setScale(2, RoundingMode.HALF_UP);
			resultado.add(OrcamentoItemResponse.builder()
					.tipo_item(tipoItem.toUpperCase())
					.id_produto(item.getId_produto())
					.id_servico(item.getId_servico())
					.descricao(item.getDescricao().trim())
					.quantidade(quantidade)
					.valor_unitario(valorUnitario)
					.percentual_desconto(percentualDesconto)
					.valor_desconto(valorDesconto)
					.valor_total(valorTotal)
					.ordem(item.getOrdem() == null || item.getOrdem() < 1 ? index + 1 : item.getOrdem())
					.build());
		}
		return resultado;
	}

	private List<BigDecimal> quebrarParcelas(BigDecimal total, int quantidadeParcelas) {
		List<BigDecimal> parcelas = new ArrayList<>();
		BigDecimal valorBase = total.divide(BigDecimal.valueOf(quantidadeParcelas), 2, RoundingMode.DOWN);
		BigDecimal acumulado = ZERO;
		for (int i = 0; i < quantidadeParcelas; i++) {
			BigDecimal valor = i == quantidadeParcelas - 1
					? total.subtract(acumulado).setScale(2, RoundingMode.HALF_UP)
					: valorBase;
			parcelas.add(valor);
			acumulado = acumulado.add(valor).setScale(2, RoundingMode.HALF_UP);
		}
		return parcelas;
	}

	private String gerarCodigo(String prefixo, long referencia) {
		return prefixo + "-" + referencia;
	}

	private String gerarCodigoSequencial(String prefixo, long sequencial) {
		return "%s-%06d".formatted(prefixo, sequencial);
	}

	private String normalizarFormaPagamento(String formaPagamento) {
		return blankToNull(formaPagamento) == null ? null : formaPagamento.trim().toUpperCase();
	}

	private BigDecimal monetary(BigDecimal value) {
		return value == null ? ZERO : value.setScale(2, RoundingMode.HALF_UP);
	}

	private BigDecimal quantity(BigDecimal value) {
		return value == null ? ZERO_QUANTIDADE : value.setScale(3, RoundingMode.HALF_UP);
	}

	private BigDecimal percentage(BigDecimal value) {
		BigDecimal percentual = value == null ? ZERO : value.setScale(2, RoundingMode.HALF_UP);
		if (percentual.compareTo(BigDecimal.valueOf(100)) > 0 || percentual.compareTo(ZERO) < 0) {
			throw new DefaultErrorException("Percentual de desconto invalido.", HttpStatus.BAD_REQUEST);
		}
		return percentual;
	}

	private String blankToNull(String value) {
		return value == null || value.trim().isEmpty() ? null : value.trim();
	}

	private String appendObservacao(String atual, String novaLinha) {
		String conteudo = blankToNull(novaLinha);
		if (conteudo == null) {
			return atual;
		}
		String base = blankToNull(atual);
		if (base == null) {
			return conteudo;
		}
		return base + System.lineSeparator() + System.lineSeparator() + conteudo;
	}

	private int normalizarLimite(int limit) {
		if (limit <= 0) {
			return 10;
		}
		return Math.min(limit, 100);
	}

	private int normalizarPagina(int page) {
		return Math.max(1, page);
	}
}
