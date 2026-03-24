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
import br.com.sistema_gerencial.models.requests.AtualizarAtendimentoRequest;
import br.com.sistema_gerencial.models.requests.CadastrarAtendimentoRequest;
import br.com.sistema_gerencial.models.requests.StatusRequest;
import br.com.sistema_gerencial.models.response.AtendimentoResponse;
import br.com.sistema_gerencial.services.AtendimentoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/atendimento")
@RequiredArgsConstructor
@Tag(name = "Atendimento", description = "Endpoints de atendimentos")
public class AntendimentoController {
	
	private final AtendimentoService atendimentoService;
	
	/**
	 * Executa o metodo cadastrar.
	 * @param request valor do parametro request.
	 * @return resultado da operacao.
	 */
	@PostMapping("/cadastrar")
	@Operation(summary = "Cadastra um atendimento", description = "Cria um novo atendimento vinculado a uma empresa.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "201", description = "Atendimento cadastrado com sucesso", content = @Content),
			@ApiResponse(responseCode = "400", description = "Requisicao invalida", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<Void> cadastrar(@RequestBody CadastrarAtendimentoRequest request) {
		atendimentoService.cadastrar(request);
		return ResponseEntity.status(HttpStatus.CREATED).build();
	}
	
	/**
	 * Executa o metodo listarTodasPorPagina.
	 * @param limit valor do parametro limit.
	 * @param page valor do parametro page.
	 * @param id valor do parametro id.
	 * @return resultado da operacao.
	 */
	@GetMapping("/listar")	
	@Operation(summary = "Lista atendimentos paginados", description = "Retorna os atendimentos de uma empresa com paginacao.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Atendimentos listados com sucesso", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Map.class))),
			@ApiResponse(responseCode = "400", description = "Parametros invalidos", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<Map<String, Object>> listarTodasPorPagina(@RequestParam int limit, @RequestParam int page, @RequestParam int id){		
		return ResponseEntity.status(HttpStatus.OK).body(atendimentoService.listarPorPagina(limit, page, id));
	} 
	
	/**
	 * Executa o metodo buscarPorId.
	 * @param id valor do parametro id.
	 * @return resultado da operacao.
	 */
	@GetMapping("/buscar-por-id/{id}")
	@Operation(summary = "Busca atendimento por id", description = "Retorna os dados de um atendimento especifico.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Atendimento encontrado com sucesso", content = @Content(mediaType = "application/json", schema = @Schema(implementation = AtendimentoResponse.class))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "404", description = "Atendimento nao encontrado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<AtendimentoResponse> buscarPorId(@PathVariable int id){
		return ResponseEntity.status(HttpStatus.OK).body(atendimentoService.buscarPorId(id));
	}
	
	/**
	 * Executa o metodo atualizar.
	 * @param request valor do parametro request.
	 * @return resultado da operacao.
	 */
	@PutMapping("/atualizar")
	@Operation(summary = "Atualiza um atendimento", description = "Atualiza os dados de um atendimento existente.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "204", description = "Atendimento atualizado com sucesso", content = @Content),
			@ApiResponse(responseCode = "400", description = "Requisicao invalida", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "404", description = "Atendimento nao encontrado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<Void> atualizar(@RequestBody AtualizarAtendimentoRequest request){
		atendimentoService.atualizar(request);
		return ResponseEntity.status(HttpStatus.NO_CONTENT).build();		
	}
	
	/**
	 * Executa o metodo alterarStatus.
	 * @param id valor do parametro id.
	 * @param status valor do parametro status.
	 * @param request valor do parametro request.
	 * @return resultado da operacao.
	 */
	@PutMapping("alterar-status")
	@Operation(summary = "Altera o status do atendimento", description = "Atualiza o status de um atendimento e registra o motivo de cancelamento quando informado.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "204", description = "Status alterado com sucesso", content = @Content),
			@ApiResponse(responseCode = "400", description = "Requisicao invalida", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "404", description = "Atendimento nao encontrado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<Void> alterarStatus(@RequestParam int id, @RequestParam int status, @RequestBody StatusRequest request) {
		atendimentoService.alterarStatus(id, status, request.getMotivo_cancelamento());
		return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	}
	
	/**
	 * Executa o metodo excluirPorId.
	 * @param id valor do parametro id.
	 * @return resultado da operacao.
	 */
	@DeleteMapping("/excluir/{id}")
	@Operation(summary = "Exclui um atendimento", description = "Remove um atendimento pelo identificador.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "204", description = "Atendimento excluido com sucesso", content = @Content),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "404", description = "Atendimento nao encontrado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<Void> excluirPorId(@PathVariable int id){
		atendimentoService.excluir(id);
		return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	}
}

