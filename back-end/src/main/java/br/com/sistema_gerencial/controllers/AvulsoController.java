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
import br.com.sistema_gerencial.models.requests.AtualizarAvulsoRequest;
import br.com.sistema_gerencial.models.requests.CadastrarAvulsoRequest;
import br.com.sistema_gerencial.models.requests.StatusRequest;
import br.com.sistema_gerencial.models.response.AvulsoResponse;
import br.com.sistema_gerencial.services.AvulsoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

/**
 * Expõe os endpoints HTTP de serviços avulsos e delega as operações à camada de serviço.
 */
@RestController
@RequestMapping("/avulso")
@RequiredArgsConstructor
@Tag(name = "Avulso", description = "Endpoints de chamados avulsos")
public class AvulsoController {
	
	private final AvulsoService avulsoService;	
		
	/**
	 * Executa o metodo cadastrar.
	 * @param request valor do parametro request.
	 * @return resultado da operacao.
	 */
	@PostMapping("/cadastrar")
	@Operation(summary = "Cadastra um chamado avulso", description = "Cria um novo atendimento avulso.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "201", description = "Chamado avulso cadastrado com sucesso", content = @Content),
			@ApiResponse(responseCode = "400", description = "Requisicao invalida", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<Void> cadastrar(@RequestBody CadastrarAvulsoRequest request) {
		avulsoService.cadastrar(request);
		return ResponseEntity.status(HttpStatus.CREATED).build();
	}
	
	/**
	 * Executa o metodo listarTodasPorPagina.
	 * @param limit valor do parametro limit.
	 * @param page valor do parametro page.
	 * @return resultado da operacao.
	 */
	@GetMapping("/listar")	
	@Operation(summary = "Lista chamados avulsos paginados", description = "Retorna chamados avulsos com paginacao.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Chamados avulsos listados com sucesso", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Map.class))),
			@ApiResponse(responseCode = "400", description = "Parametros de paginacao invalidos", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<Map<String, Object>> listarTodasPorPagina(@RequestParam int limit, @RequestParam int page){		
		return ResponseEntity.status(HttpStatus.OK).body(avulsoService.listarPorPagina(limit, page));
	}
	
	/**
	 * Executa o metodo listarTodasPorAtributoEPagina.
	 * @param limit valor do parametro limit.
	 * @param page valor do parametro page.
	 * @param pesquisa valor do parametro pesquisa.
	 * @param tipoConsulta valor do parametro tipoConsulta.
	 * @return resultado da operacao.
	 */
	@GetMapping("/listar-com-pesquisa")	
	@Operation(summary = "Lista chamados avulsos com pesquisa", description = "Retorna chamados avulsos filtrados por pesquisa e tipo de consulta.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Chamados avulsos listados com sucesso", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Map.class))),
			@ApiResponse(responseCode = "400", description = "Parametros de pesquisa invalidos", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<Map<String, Object>> listarTodasPorAtributoEPagina(@RequestParam int limit, @RequestParam int page,
			@RequestParam String pesquisa, @RequestParam String tipoConsulta){		
		return ResponseEntity.status(HttpStatus.OK).body(avulsoService.listarPorAtributoEPagina(limit, page, pesquisa, tipoConsulta));
	} 
	
	/**
	 * Executa o metodo buscarPorId.
	 * @param id valor do parametro id.
	 * @return resultado da operacao.
	 */
	@GetMapping("/buscar-por-id/{id}")
	@Operation(summary = "Busca chamado avulso por id", description = "Retorna os dados de um chamado avulso especifico.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Chamado avulso encontrado com sucesso", content = @Content(mediaType = "application/json", schema = @Schema(implementation = AvulsoResponse.class))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "404", description = "Chamado avulso nao encontrado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<AvulsoResponse> buscarPorId(@PathVariable int id){
		return ResponseEntity.status(HttpStatus.OK).body(avulsoService.buscarPorId(id));
	}
	
	/**
	 * Executa o metodo atualizar.
	 * @param request valor do parametro request.
	 * @return resultado da operacao.
	 */
	@PutMapping("/atualizar")
	@Operation(summary = "Atualiza um chamado avulso", description = "Atualiza os dados de um chamado avulso existente.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "204", description = "Chamado avulso atualizado com sucesso", content = @Content),
			@ApiResponse(responseCode = "400", description = "Requisicao invalida", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "404", description = "Chamado avulso nao encontrado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<Void> atualizar(@RequestBody AtualizarAvulsoRequest request){
		avulsoService.atualizar(request);
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
	@Operation(summary = "Altera o status do chamado avulso", description = "Atualiza o status de um chamado avulso e registra o motivo de cancelamento quando informado.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "204", description = "Status alterado com sucesso", content = @Content),
			@ApiResponse(responseCode = "400", description = "Requisicao invalida", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "404", description = "Chamado avulso nao encontrado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<Void> alterarStatus(@RequestParam int id, @RequestParam int status, @RequestBody StatusRequest request) {
		avulsoService.alterarStatus(id, status, request.getMotivo_cancelamento());
		return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	}
	
	/**
	 * Executa o metodo excluirPorId.
	 * @param id valor do parametro id.
	 * @return resultado da operacao.
	 */
	@DeleteMapping("/excluir/{id}")
	@Operation(summary = "Exclui um chamado avulso", description = "Remove um chamado avulso pelo identificador.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "204", description = "Chamado avulso excluido com sucesso", content = @Content),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "404", description = "Chamado avulso nao encontrado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<Void> excluirPorId(@PathVariable int id){
		avulsoService.excluir(id);
		return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	}

}

