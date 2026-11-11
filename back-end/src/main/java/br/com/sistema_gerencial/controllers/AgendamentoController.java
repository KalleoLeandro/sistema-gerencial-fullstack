package br.com.sistema_gerencial.controllers;

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

import br.com.sistema_gerencial.exceptions.ApiError;
import br.com.sistema_gerencial.exceptions.schemas.DefaultErrorResponse;
import br.com.sistema_gerencial.models.requests.AtualizarAgendamentoRequest;
import br.com.sistema_gerencial.models.requests.CadastrarAgendamentoRequest;
import br.com.sistema_gerencial.models.response.AgendamentoResponse;
import br.com.sistema_gerencial.services.AgendamentoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

/**
 * Expõe os endpoints HTTP de agendamentos e delega as operações à camada de serviço.
 */
@RestController
@RequestMapping("/agendamento")
@RequiredArgsConstructor
@Tag(name = "Agendamento", description = "Endpoints de agendamentos")
public class AgendamentoController {

	private final AgendamentoService agendamentoService;

	@PostMapping("/cadastrar")
	@Operation(summary = "Cadastra um agendamento", description = "Cria um novo agendamento.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "201", description = "Agendamento cadastrado com sucesso", content = @Content),
			@ApiResponse(responseCode = "400", description = "Requisicao invalida", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<Void> cadastrar(@RequestBody CadastrarAgendamentoRequest request) {
		agendamentoService.cadastrar(request);
		return ResponseEntity.status(HttpStatus.CREATED).build();
	}

	@GetMapping("/listar")
	@Operation(summary = "Lista agendamentos paginados", description = "Retorna agendamentos com paginacao.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Agendamentos listados com sucesso", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Map.class))),
			@ApiResponse(responseCode = "400", description = "Parametros invalidos", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<Map<String, Object>> listarPorPagina(@RequestParam int limit, @RequestParam int page) {
		return ResponseEntity.status(HttpStatus.OK).body(agendamentoService.listarPorPagina(limit, page));
	}

	@GetMapping("/buscar-por-id/{id}")
	@Operation(summary = "Busca agendamento por id", description = "Retorna os dados de um agendamento especifico.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Agendamento encontrado com sucesso", content = @Content(mediaType = "application/json", schema = @Schema(implementation = AgendamentoResponse.class))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "404", description = "Agendamento nao encontrado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<AgendamentoResponse> buscarPorId(@PathVariable int id) {
		return ResponseEntity.status(HttpStatus.OK).body(agendamentoService.buscarPorId(id));
	}

	@PutMapping("/atualizar")
	@Operation(summary = "Atualiza um agendamento", description = "Atualiza os dados de um agendamento existente.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "204", description = "Agendamento atualizado com sucesso", content = @Content),
			@ApiResponse(responseCode = "400", description = "Requisicao invalida", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "404", description = "Agendamento nao encontrado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<Void> atualizar(@RequestBody AtualizarAgendamentoRequest request) {
		agendamentoService.atualizar(request);
		return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	}

	@DeleteMapping("/excluir/{id}")
	@Operation(summary = "Exclui um agendamento", description = "Remove um agendamento pelo identificador.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "204", description = "Agendamento excluido com sucesso", content = @Content),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "404", description = "Agendamento nao encontrado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<Void> excluirPorId(@PathVariable int id) {
		agendamentoService.excluir(id);
		return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	}
}
