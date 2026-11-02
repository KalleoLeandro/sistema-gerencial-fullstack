package br.com.sistema_gerencial.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.sistema_gerencial.models.requests.AtualizarItensOrcamentoRequest;
import br.com.sistema_gerencial.models.requests.CriarOrcamentoRequest;
import br.com.sistema_gerencial.models.requests.CriarOrcamentoPdvRequest;
import br.com.sistema_gerencial.models.requests.ReabrirOrcamentoRequest;
import br.com.sistema_gerencial.models.requests.RejeitarOrcamentoRequest;
import br.com.sistema_gerencial.models.response.OrcamentoResponse;
import br.com.sistema_gerencial.services.FluxoComercialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

/**
 * Expõe os endpoints HTTP de orçamentos e delega as operações à camada de serviço.
 */
@RestController
@RequestMapping("/orcamentos")
@RequiredArgsConstructor
@Tag(name = "Orcamentos", description = "Fluxo de geracao e manutencao de orcamentos")
public class OrcamentoController {

	private final FluxoComercialService fluxoComercialService;

	@GetMapping("/buscar-por-id/{id}")
	@Operation(summary = "Busca um orcamento por id")
	public ResponseEntity<OrcamentoResponse> buscarPorId(@PathVariable int id) {
		return ResponseEntity.status(HttpStatus.OK).body(fluxoComercialService.buscarOrcamentoPorId(id));
	}

	@GetMapping("/buscar-por-origem")
	@Operation(summary = "Busca o orcamento vinculado a um atendimento, manutencao ou avulso")
	public ResponseEntity<OrcamentoResponse> buscarPorOrigem(@RequestParam String origemTipo, @RequestParam int origemId) {
		return ResponseEntity.status(HttpStatus.OK).body(fluxoComercialService.buscarOrcamentoPorOrigem(origemTipo, origemId));
	}

	@GetMapping("/listar")
	@Operation(summary = "Lista orcamentos de forma paginada")
	public ResponseEntity<?> listar(
			@RequestParam(defaultValue = "10") int limit,
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(required = false) String pesquisa) {
		return ResponseEntity.status(HttpStatus.OK).body(fluxoComercialService.listarOrcamentosPorPagina(limit, page, pesquisa));
	}

	@PostMapping("/criar-pdv")
	@Operation(summary = "Cria um orcamento para o modulo PDV")
	public ResponseEntity<OrcamentoResponse> criarPdv(@RequestBody(required = false) CriarOrcamentoPdvRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(fluxoComercialService.criarOrcamentoPdv(request));
	}

	@PostMapping("/criar")
	@Operation(summary = "Cria um orcamento livre ou vinculado a uma origem")
	public ResponseEntity<OrcamentoResponse> criar(@RequestBody(required = false) CriarOrcamentoRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(fluxoComercialService.criarOrcamento(request));
	}

	@PutMapping("/atualizar-itens")
	@Operation(summary = "Atualiza os itens e totais do orcamento")
	public ResponseEntity<OrcamentoResponse> atualizarItens(@RequestBody AtualizarItensOrcamentoRequest request) {
		return ResponseEntity.status(HttpStatus.OK).body(fluxoComercialService.atualizarItens(request));
	}

	@PutMapping("/rejeitar")
	@Operation(summary = "Rejeita o orcamento e cancela a origem quando aplicavel")
	public ResponseEntity<OrcamentoResponse> rejeitar(@RequestBody RejeitarOrcamentoRequest request) {
		return ResponseEntity.status(HttpStatus.OK).body(fluxoComercialService.rejeitarOrcamento(request));
	}

	@PutMapping("/reabrir")
	@Operation(summary = "Reabre um orcamento rejeitado de atendimento")
	public ResponseEntity<OrcamentoResponse> reabrir(@RequestBody ReabrirOrcamentoRequest request) {
		return ResponseEntity.status(HttpStatus.OK).body(fluxoComercialService.reabrirOrcamento(request));
	}
}
