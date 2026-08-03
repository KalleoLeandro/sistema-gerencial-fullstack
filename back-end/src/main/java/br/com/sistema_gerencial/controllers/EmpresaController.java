package br.com.sistema_gerencial.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
import br.com.sistema_gerencial.models.requests.AtualizarEmpresaRequest;
import br.com.sistema_gerencial.models.requests.CadastrarEmpresaRequest;
import br.com.sistema_gerencial.models.requests.RenovarContratoRequest;
import br.com.sistema_gerencial.models.response.EmpresaResponse;
import br.com.sistema_gerencial.models.response.RenovacaoContratoResponse;
import br.com.sistema_gerencial.services.EmpresaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/empresa")
@RequiredArgsConstructor
@Tag(name = "Empresa", description = "Endpoints de empresas")
public class EmpresaController {
	
	private final EmpresaService empresaService;
	
	/**
	 * Executa o metodo cadastrar.
	 * @param request valor do parametro request.
	 * @return resultado da operacao.
	 */
	@PostMapping("/cadastrar")
	@PreAuthorize("hasAnyRole('ADMIN', 'DEV', 'COMERCIAL')")
	@Operation(summary = "Cadastra uma empresa", description = "Cria uma nova empresa no sistema.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "201", description = "Empresa cadastrada com sucesso", content = @Content),
			@ApiResponse(responseCode = "400", description = "Requisicao invalida", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "403", description = "Usuario sem permissao para cadastrar empresa", content = @Content),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<Void> cadastrar(@RequestBody CadastrarEmpresaRequest request){
		empresaService.cadastrar(request);
		return ResponseEntity.status(HttpStatus.CREATED).build();
	}
	
	/**
	 * Executa o metodo listarTodasPorPagina.
	 * @param limit valor do parametro limit.
	 * @param page valor do parametro page.
	 * @return resultado da operacao.
	 */
	@GetMapping("/listar")
	@Operation(summary = "Lista empresas paginadas", description = "Retorna empresas cadastradas com paginacao.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Empresas listadas com sucesso", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Map.class))),
			@ApiResponse(responseCode = "400", description = "Parametros de paginacao invalidos", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<Map<String, Object>> listarTodasPorPagina(@RequestParam int limit, @RequestParam int page){		
		return ResponseEntity.status(HttpStatus.OK).body(empresaService.listarPorPagina(limit, page));
	}
	
	/**
	 * Executa o metodo listarTodasPorPaginaENome.
	 * @param limit valor do parametro limit.
	 * @param page valor do parametro page.
	 * @param nome valor do parametro nome.
	 * @return resultado da operacao.
	 */
	@GetMapping("/listar-por-nome")
	@Operation(summary = "Lista empresas por nome", description = "Retorna empresas filtradas por nome com paginacao.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Empresas listadas com sucesso", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Map.class))),
			@ApiResponse(responseCode = "400", description = "Parametros invalidos", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<Map<String, Object>> listarTodasPorPaginaENome(@RequestParam int limit, @RequestParam int page, @RequestParam String nome){		
		return ResponseEntity.status(HttpStatus.OK).body(empresaService.listarPorPaginaENome(limit, page, nome));
	}
	
	/**
	 * Executa o metodo atualizar.
	 * @param request valor do parametro request.
	 * @return resultado da operacao.
	 */
	@PutMapping("/atualizar")
	@PreAuthorize("hasAnyRole('ADMIN', 'DEV', 'COMERCIAL')")
	@Operation(summary = "Atualiza uma empresa", description = "Atualiza os dados de uma empresa existente.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "204", description = "Empresa atualizada com sucesso", content = @Content),
			@ApiResponse(responseCode = "400", description = "Requisicao invalida", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "403", description = "Usuario sem permissao para atualizar empresa", content = @Content),
			@ApiResponse(responseCode = "404", description = "Empresa nao encontrada", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<Void> atualizar(@RequestBody AtualizarEmpresaRequest request){
		empresaService.atualizar(request);
		return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	}
	
	/**
	 * Executa o metodo buscarPorId.
	 * @param id valor do parametro id.
	 * @return resultado da operacao.
	 */
	@GetMapping("/buscar-por-id/{id}")
	@Operation(summary = "Busca empresa por id", description = "Retorna os dados completos de uma empresa.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Empresa encontrada com sucesso", content = @Content(mediaType = "application/json", schema = @Schema(implementation = EmpresaResponse.class))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "404", description = "Empresa nao encontrada", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<EmpresaResponse> buscarPorId(@PathVariable int id){		
		return ResponseEntity.status(HttpStatus.OK).body(empresaService.buscarPorId(id));
	}
	
	/**
	 * Executa o metodo excluirPorId.
	 * @param id valor do parametro id.
	 * @return resultado da operacao.
	 */
	@DeleteMapping("/excluir/{id}")
	@PreAuthorize("hasAnyRole('ADMIN', 'DEV', 'COMERCIAL')")
	@Operation(summary = "Exclui uma empresa", description = "Remove uma empresa do sistema pelo identificador.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "204", description = "Empresa excluida com sucesso", content = @Content),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "403", description = "Usuario sem permissao para excluir empresa", content = @Content),
			@ApiResponse(responseCode = "404", description = "Empresa nao encontrada", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<Void> excluirPorId(@PathVariable int id){		
		empresaService.excluir(id);
		return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	}
	
	/**
	 * Executa o metodo salvarInfra.
	 * @param texto valor do parametro texto.
	 * @param id valor do parametro id.
	 * @return resultado da operacao.
	 */
	@PostMapping("salvar-infra/{id}") 
	@PreAuthorize("hasAnyRole('ADMIN', 'DEV', 'COMERCIAL')")
	@Operation(summary = "Salva a infraestrutura da empresa", description = "Persiste o texto de infraestrutura vinculado a uma empresa.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "204", description = "Infraestrutura salva com sucesso", content = @Content),
			@ApiResponse(responseCode = "400", description = "Requisicao invalida", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "403", description = "Usuario sem permissao para salvar infraestrutura", content = @Content),
			@ApiResponse(responseCode = "404", description = "Empresa nao encontrada", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	ResponseEntity<Void> salvarInfra(@RequestBody String texto, @PathVariable int id){		
		empresaService.salvarInfraestrutura(texto, id);
		return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	} 

	@PostMapping("/renovar-contrato/{id}")
	@PreAuthorize("hasAnyRole('ADMIN', 'DEV', 'COMERCIAL')")
	public ResponseEntity<Void> renovarContrato(@PathVariable int id, @RequestBody RenovarContratoRequest request) {
		empresaService.renovarContrato(id, request);
		return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	}

	@GetMapping("/listar-renovacoes/{id}")
	public ResponseEntity<List<RenovacaoContratoResponse>> listarRenovacoes(@PathVariable int id) {
		return ResponseEntity.status(HttpStatus.OK).body(empresaService.listarRenovacoes(id));
	}

}

