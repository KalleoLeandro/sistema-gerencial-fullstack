package br.com.sistema_gerencial.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.sistema_gerencial.models.requests.AtualizarServicoRequest;
import br.com.sistema_gerencial.models.requests.CadastrarServicoRequest;
import br.com.sistema_gerencial.models.response.ServicoResponse;
import br.com.sistema_gerencial.services.ServicoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/servicos")
@RequiredArgsConstructor
@Tag(name = "Servicos", description = "Endpoints de cadastro e consulta de servicos")
public class ServicoController {

	private final ServicoService servicoService;

	@PostMapping("/cadastrar")
	@Operation(summary = "Cadastra um servico")
	public ResponseEntity<Void> cadastrar(@RequestBody CadastrarServicoRequest request) {
		servicoService.cadastrar(request);
		return ResponseEntity.status(HttpStatus.CREATED).build();
	}

	@GetMapping("/listar")
	@Operation(summary = "Lista servicos paginados")
	public ResponseEntity<Map<String, Object>> listar(@RequestParam int limit, @RequestParam int page) {
		return ResponseEntity.status(HttpStatus.OK).body(servicoService.listarPorPagina(limit, page));
	}

	@GetMapping("/listar-ativos")
	@Operation(summary = "Lista servicos ativos")
	public ResponseEntity<List<ServicoResponse>> listarAtivos() {
		return ResponseEntity.status(HttpStatus.OK).body(servicoService.listarAtivos());
	}

	@GetMapping("/buscar-por-id/{id}")
	@Operation(summary = "Busca um servico por id")
	public ResponseEntity<ServicoResponse> buscarPorId(@PathVariable int id) {
		return ResponseEntity.status(HttpStatus.OK).body(servicoService.buscarPorId(id));
	}

	@PutMapping("/atualizar")
	@Operation(summary = "Atualiza um servico")
	public ResponseEntity<Void> atualizar(@RequestBody AtualizarServicoRequest request) {
		servicoService.atualizar(request);
		return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	}

	@DeleteMapping("/excluir/{id}")
	@Operation(summary = "Exclui um servico")
	public ResponseEntity<Void> excluir(@PathVariable int id) {
		servicoService.excluir(id);
		return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	}
}
