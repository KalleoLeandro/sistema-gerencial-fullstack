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

import br.com.sistema_gerencial.models.requests.AprovarOrcamentoRequest;
import br.com.sistema_gerencial.models.requests.AtualizarVendaRequest;
import br.com.sistema_gerencial.models.response.VendaResponse;
import br.com.sistema_gerencial.services.FluxoComercialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/vendas")
@RequiredArgsConstructor
@Tag(name = "Vendas", description = "Fluxo de aprovacao de orcamentos e geracao de vendas")
public class VendaController {

	private final FluxoComercialService fluxoComercialService;

	@PostMapping("/aprovar-orcamento")
	@Operation(summary = "Aprova um orcamento e converte em venda")
	public ResponseEntity<VendaResponse> aprovarOrcamento(@RequestBody AprovarOrcamentoRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(fluxoComercialService.aprovarOrcamento(request));
	}

	@PutMapping("/atualizar")
	@Operation(summary = "Atualiza uma venda existente")
	public ResponseEntity<VendaResponse> atualizar(@RequestBody AtualizarVendaRequest request) {
		return ResponseEntity.status(HttpStatus.OK).body(fluxoComercialService.atualizarVenda(request));
	}

	@GetMapping("/buscar-por-id/{id}")
	@Operation(summary = "Busca uma venda por id")
	public ResponseEntity<VendaResponse> buscarPorId(@PathVariable int id) {
		return ResponseEntity.status(HttpStatus.OK).body(fluxoComercialService.buscarVendaPorId(id));
	}

	@GetMapping("/listar")
	@Operation(summary = "Lista vendas de forma paginada")
	public ResponseEntity<?> listar(
			@RequestParam(defaultValue = "10") int limit,
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(required = false) String pesquisa) {
		return ResponseEntity.status(HttpStatus.OK).body(fluxoComercialService.listarVendasPorPagina(limit, page, pesquisa));
	}
}
