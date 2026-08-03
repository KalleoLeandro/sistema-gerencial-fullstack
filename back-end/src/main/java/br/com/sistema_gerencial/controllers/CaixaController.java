package br.com.sistema_gerencial.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.sistema_gerencial.models.requests.FecharCaixaRequest;
import br.com.sistema_gerencial.models.response.CaixaFechamentoResponse;
import br.com.sistema_gerencial.models.response.CaixaResumoDiaResponse;
import br.com.sistema_gerencial.services.FluxoComercialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/caixa")
@RequiredArgsConstructor
@Tag(name = "Caixa", description = "Resumo diario e historico de fechamentos do caixa")
public class CaixaController {

	private final FluxoComercialService fluxoComercialService;

	@GetMapping("/resumo-dia")
	@Operation(summary = "Retorna o resumo do caixa do dia")
	public ResponseEntity<CaixaResumoDiaResponse> resumoDia() {
		return ResponseEntity.status(HttpStatus.OK).body(fluxoComercialService.buscarResumoCaixaDia());
	}

	@PostMapping("/fechar")
	@Operation(summary = "Fecha o caixa do dia e registra eventual quebra")
	public ResponseEntity<CaixaFechamentoResponse> fechar(@RequestBody FecharCaixaRequest request) {
		return ResponseEntity.status(HttpStatus.OK).body(fluxoComercialService.fecharCaixa(request));
	}
}
