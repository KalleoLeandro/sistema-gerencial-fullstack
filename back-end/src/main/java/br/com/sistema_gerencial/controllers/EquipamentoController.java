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
import br.com.sistema_gerencial.models.requests.AtualizarEquipamentoRequest;
import br.com.sistema_gerencial.models.requests.CadastrarEquipamentoRequest;
import br.com.sistema_gerencial.models.response.EquipamentoResponse;
import br.com.sistema_gerencial.services.EquipamentoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

/**
 * Expõe os endpoints HTTP de equipamentos e delega as operações à camada de serviço.
 */
@RestController
@RequestMapping("/equipamento")
@RequiredArgsConstructor
@Tag(name = "Equipamento", description = "Endpoints de equipamentos")
public class EquipamentoController {
	
	private final EquipamentoService equipamentoService;
	
	/**
	 * Executa o metodo cadastrar.
	 * @param request valor do parametro request.
	 * @return resultado da operacao.
	 */
	@PostMapping("/cadastrar")
	@Operation(summary = "Cadastra um equipamento", description = "Cria um novo equipamento vinculado a uma empresa.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "201", description = "Equipamento cadastrado com sucesso", content = @Content),
			@ApiResponse(responseCode = "400", description = "Requisicao invalida", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<Void> cadastrar(@RequestBody CadastrarEquipamentoRequest request){
		equipamentoService.cadastrar(request);
		return ResponseEntity.status(HttpStatus.CREATED).build();
	}
	
	/**
	 * Executa o metodo listarTodasPorPagina.
	 * @param limit valor do parametro limit.
	 * @param page valor do parametro page.
	 * @param id_empresa valor do parametro id_empresa.
	 * @return resultado da operacao.
	 */
	@GetMapping("/listar")
	@Operation(summary = "Lista equipamentos paginados", description = "Retorna os equipamentos de uma empresa com paginacao.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Equipamentos listados com sucesso", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Map.class))),
			@ApiResponse(responseCode = "400", description = "Parametros invalidos", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<Map<String, Object>> listarTodasPorPagina(@RequestParam int limit, @RequestParam int page, @RequestParam int id_empresa){		
		return ResponseEntity.status(HttpStatus.OK).body(equipamentoService.listarPorPagina(limit, page, id_empresa));
	}
	
	/**
	 * Executa o metodo buscarPorId.
	 * @param id valor do parametro id.
	 * @return resultado da operacao.
	 */
	@GetMapping("/buscar-por-id/{id}")
	@Operation(summary = "Busca equipamento por id", description = "Retorna os dados de um equipamento especifico.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Equipamento encontrado com sucesso", content = @Content(mediaType = "application/json", schema = @Schema(implementation = EquipamentoResponse.class))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "404", description = "Equipamento nao encontrado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<EquipamentoResponse> buscarPorId(@PathVariable int id){
		return ResponseEntity.status(HttpStatus.OK).body(equipamentoService.buscarPorId(id));
	}
	
	/**
	 * Executa o metodo atualizar.
	 * @param request valor do parametro request.
	 * @return resultado da operacao.
	 */
	@PutMapping("/atualizar")
	@Operation(summary = "Atualiza um equipamento", description = "Atualiza os dados de um equipamento existente.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "204", description = "Equipamento atualizado com sucesso", content = @Content),
			@ApiResponse(responseCode = "400", description = "Requisicao invalida", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "404", description = "Equipamento nao encontrado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<Void> atualizar(@RequestBody AtualizarEquipamentoRequest request){
		equipamentoService.atualizar(request);
		return ResponseEntity.status(HttpStatus.NO_CONTENT).build();		
	}
	
	/**
	 * Executa o metodo excluirPorId.
	 * @param id valor do parametro id.
	 * @return resultado da operacao.
	 */
	@DeleteMapping("/excluir/{id}")
	@Operation(summary = "Exclui um equipamento", description = "Remove um equipamento pelo identificador.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "204", description = "Equipamento excluido com sucesso", content = @Content),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "404", description = "Equipamento nao encontrado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<Void> excluirPorId(@PathVariable int id){
		equipamentoService.excluir(id);
		return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	}

}

