package br.com.sistema_gerencial.services.impl;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.sistema_gerencial.exceptions.DefaultErrorException;
import br.com.sistema_gerencial.models.requests.AtualizarAvulsoRequest;
import br.com.sistema_gerencial.models.requests.CadastrarAvulsoRequest;
import br.com.sistema_gerencial.models.response.AvulsoResponse;
import br.com.sistema_gerencial.repositories.AvulsoRepository;
import br.com.sistema_gerencial.services.AvulsoService;
import br.com.sistema_gerencial.services.FluxoComercialService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AvulsoServiceImpl implements AvulsoService {

	private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
	private final AvulsoRepository repository;
	private final FluxoComercialService fluxoComercialService;

	/**
	 * Executa o metodo cadastrar.
	 * @param request valor do parametro request.
	 */
	@Override
	@Transactional
	public void cadastrar(CadastrarAvulsoRequest request) {
		request.setObservacoes(montarHistoricoObservacoes(null, request.getObservacoes(), null, true, null));
		int idAvulso = repository.cadastrar(request);
		fluxoComercialService.gerarOrcamentoParaOrigem("AVULSO", idAvulso);
	}

	/**
	 * Executa o metodo listarPorPagina.
	 * @param limit valor do parametro limit.
	 * @param page valor do parametro page.
	 * @return resultado da operacao.
	 */
	@Override
	@Transactional
	public Map<String, Object> listarPorPagina(int limit, int page) {
		return repository.listarPorPagina(limit, page);
	}

	/**
	 * Executa o metodo listarPorAtributoEPagina.
	 * @param limit valor do parametro limit.
	 * @param page valor do parametro page.
	 * @param pesquisa valor do parametro pesquisa.
	 * @param tipoConsulta valor do parametro tipoConsulta.
	 * @return resultado da operacao.
	 */
	@Override
	@Transactional
	public Map<String, Object> listarPorAtributoEPagina(int limit, int page, String pesquisa, String tipoConsulta) {
		return repository.listarPorAtributoEPagina(limit, page, pesquisa, tipoConsulta);
	}

	/**
	 * Executa o metodo buscarPorId.
	 * @param id valor do parametro id.
	 * @return resultado da operacao.
	 */
	@Override
	@Transactional
	public AvulsoResponse buscarPorId(int id) {
		return repository.buscarPorId(id);
	}

	/**
	 * Executa o metodo atualizar.
	 * @param request valor do parametro request.
	 */
	@Override
	@Transactional
	public void atualizar(AtualizarAvulsoRequest request) {
		AvulsoResponse atual = repository.buscarPorId(request.getId());
		boolean dataAlterada = houveAlteracaoData(atual.getData_inicio(), request.getData_inicio())
				|| houveAlteracaoData(atual.getData_fim(), request.getData_fim());
		if (dataAlterada && isBlank(request.getJustificativa_alteracao_data())) {
			throw new DefaultErrorException("Informe a justificativa da alteracao de horario.", HttpStatus.BAD_REQUEST);
		}
		request.setObservacoes(montarHistoricoObservacoes(atual.getObservacoes(), request.getObservacoes(),
				dataAlterada ? request.getJustificativa_alteracao_data() : null, false, null));
		repository.atualizar(request);
	}

	private boolean houveAlteracaoData(LocalDateTime atual, LocalDateTime novaData) {
		if (atual == null && novaData == null) {
			return false;
		}
		if (atual == null || novaData == null) {
			return true;
		}
		return !atual.equals(novaData);
	}

	private String montarHistoricoObservacoes(String historicoAtual, String novaObservacao, String justificativaAlteracaoData,
			boolean registrarAbertura, Integer novoStatus) {
		StringBuilder builder = new StringBuilder();
		appendBloco(builder, historicoAtual);
		if (registrarAbertura) {
			appendBloco(builder, String.format("[%s] Registro aberto com status: %s",
					LocalDateTime.now().format(DATE_TIME_FORMATTER), descricaoStatus(1)));
		}
		if (novoStatus != null) {
			appendBloco(builder, String.format("[%s] Status atualizado para: %s",
					LocalDateTime.now().format(DATE_TIME_FORMATTER), descricaoStatus(novoStatus)));
		}
		if (!isBlank(justificativaAlteracaoData)) {
			appendBloco(builder, String.format("[%s] Justificativa de alteracao de horario: %s",
					LocalDateTime.now().format(DATE_TIME_FORMATTER), justificativaAlteracaoData.trim()));
		}
		if (!isBlank(novaObservacao)) {
			appendBloco(builder, String.format("[%s] Observacao: %s",
					LocalDateTime.now().format(DATE_TIME_FORMATTER), novaObservacao.trim()));
		}
		return builder.toString();
	}

	private void appendBloco(StringBuilder builder, String conteudo) {
		if (isBlank(conteudo)) {
			return;
		}
		if (!builder.isEmpty()) {
			builder.append(System.lineSeparator()).append(System.lineSeparator());
		}
		builder.append(conteudo.trim());
	}

	private boolean isBlank(String valor) {
		return valor == null || valor.trim().isEmpty();
	}

	private String descricaoStatus(int status) {
		return switch (status) {
		case 1 -> "AGUARDANDO ATENDIMENTO";
		case 2 -> "EM ATENDIMENTO";
		case 3 -> "FINALIZADO";
		case 4 -> "CANCELADO";
		default -> "DESCONHECIDO";
		};
	}

	/**
	 * Executa o metodo alterarStatus.
	 * @param id valor do parametro id.
	 * @param status valor do parametro status.
	 * @param motivo_cancelamento valor do parametro motivo_cancelamento.
	 */
	@Override
	@Transactional
	public void alterarStatus(int id, int status, String motivo_cancelamento) {
		if (status > 4) {
			throw new DefaultErrorException("Status invalido", HttpStatus.BAD_REQUEST);
		}
		AvulsoResponse atual = repository.buscarPorId(id);
		String observacoes = montarHistoricoObservacoes(atual.getObservacoes(), null, null, false, status);
		repository.alterarStatus(id, status, motivo_cancelamento, observacoes);
	}

	/**
	 * Executa o metodo excluir.
	 * @param id valor do parametro id.
	 */
	@Override
	@Transactional
	public void excluir(int id) {
		repository.excluir(id);
	}
}

