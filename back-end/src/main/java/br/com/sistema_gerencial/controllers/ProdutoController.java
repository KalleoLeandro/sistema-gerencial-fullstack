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

import br.com.sistema_gerencial.models.requests.AtualizarProdutoRequest;
import br.com.sistema_gerencial.models.requests.CadastrarProdutoRequest;
import br.com.sistema_gerencial.models.response.ProdutoResponse;
import br.com.sistema_gerencial.services.ProdutoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/produtos")
@RequiredArgsConstructor
@Tag(name = "Produtos", description = "Endpoints de cadastro e consulta de produtos")
public class ProdutoController {

	private final ProdutoService produtoService;

	@PostMapping("/cadastrar")
	@Operation(summary = "Cadastra um produto")
	public ResponseEntity<Void> cadastrar(@RequestBody CadastrarProdutoRequest request) {
		produtoService.cadastrar(request);
		return ResponseEntity.status(HttpStatus.CREATED).build();
	}

	@GetMapping("/listar")
	@Operation(summary = "Lista produtos paginados")
	public ResponseEntity<Map<String, Object>> listar(@RequestParam int limit, @RequestParam int page) {
		return ResponseEntity.status(HttpStatus.OK).body(produtoService.listarPorPagina(limit, page));
	}

	@GetMapping("/listar-ativos")
	@Operation(summary = "Lista produtos ativos")
	public ResponseEntity<List<ProdutoResponse>> listarAtivos() {
		return ResponseEntity.status(HttpStatus.OK).body(produtoService.listarAtivos());
	}

	@GetMapping("/listar-em-falta")
	@Operation(summary = "Lista produtos em falta")
	public ResponseEntity<List<ProdutoResponse>> listarEmFalta() {
		return ResponseEntity.status(HttpStatus.OK).body(produtoService.listarEmFalta());
	}

	@GetMapping("/buscar-por-id/{id}")
	@Operation(summary = "Busca um produto por id")
	public ResponseEntity<ProdutoResponse> buscarPorId(@PathVariable int id) {
		return ResponseEntity.status(HttpStatus.OK).body(produtoService.buscarPorId(id));
	}

	@PutMapping("/atualizar")
	@Operation(summary = "Atualiza um produto")
	public ResponseEntity<Void> atualizar(@RequestBody AtualizarProdutoRequest request) {
		produtoService.atualizar(request);
		return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	}

	@DeleteMapping("/excluir/{id}")
	@Operation(summary = "Exclui um produto")
	public ResponseEntity<Void> excluir(@PathVariable int id) {
		produtoService.excluir(id);
		return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	}
}
