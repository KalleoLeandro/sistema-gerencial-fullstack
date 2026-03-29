package br.com.sistema_gerencial.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.sistema_gerencial.exceptions.schemas.DefaultErrorResponse;
import br.com.sistema_gerencial.models.dto.AgendaEventoDTO;
import br.com.sistema_gerencial.models.dto.ContratoCalendarioDTO;
import br.com.sistema_gerencial.models.dto.LucroDTO;
import br.com.sistema_gerencial.models.dto.TipoAtendimentoDTO;
import br.com.sistema_gerencial.services.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Endpoints de indicadores do dashboard")
public class DashboardController {

	private final DashboardService dashboardService;
	
	/**
	 * Executa o metodo retornarLucrosDoMes.
	 * @return resultado da operacao.
	 */
	@GetMapping("/retornar-lucro-mes")
	@Operation(summary = "Retorna o lucro do mes", description = "Retorna o consolidado de lucro do mes atual.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Indicador retornado com sucesso", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Map.class))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<Map<String, Object>> retornarLucrosDoMes(){		
		return ResponseEntity.status(HttpStatus.OK).body(dashboardService.retornarLucrosMes());
	}
	
	/**
	 * Executa o metodo retornarLucrosDoAno.
	 * @return resultado da operacao.
	 */
	@GetMapping("/retornar-lucro-ano")
	@Operation(summary = "Retorna o lucro do ano", description = "Retorna o consolidado de lucro do ano atual.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Indicador retornado com sucesso", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Map.class))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<Map<String, Object>> retornarLucrosDoAno(){		
		return ResponseEntity.status(HttpStatus.OK).body(dashboardService.retornarLucrosAno());
	}
	
	/**
	 * Executa o metodo retornarContratosEncerrando.
	 * @return resultado da operacao.
	 */
	@GetMapping("/retornar-contratos-acabando")
	@Operation(summary = "Retorna contratos acabando", description = "Retorna a quantidade de contratos proximos do encerramento.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Indicador retornado com sucesso", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Map.class))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<Map<String, Object>> retornarContratosEncerrando(){		
		return ResponseEntity.status(HttpStatus.OK).body(dashboardService.retornarContratosEncerrando());
	}
	
	/**
	 * Executa o metodo retornarChamadosCancelados.
	 * @return resultado da operacao.
	 */
	@GetMapping("/retornar-chamados-cancelados")
	@Operation(summary = "Retorna chamados cancelados", description = "Retorna a quantidade de chamados cancelados.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Indicador retornado com sucesso", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Map.class))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<Map<String, Object>> retornarChamadosCancelados(){		
		return ResponseEntity.status(HttpStatus.OK).body(dashboardService.retornarTotalChamadosCancelados());
	}

	/**
	 * Executa o metodo retornarTotalChamadosMes.
	 * @return resultado da operacao.
	 */
	@GetMapping("/retornar-total-chamados-mes")
	@Operation(summary = "Retorna total de chamados no mes", description = "Retorna a quantidade total de chamados do mes atual.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Indicador retornado com sucesso", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Map.class))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<Map<String, Object>> retornarTotalChamadosMes(){		
		return ResponseEntity.status(HttpStatus.OK).body(dashboardService.retornarTotalChamadosMes());
	}

	/**
	 * Executa o metodo retornarChamadosAtrasados.
	 * @return resultado da operacao.
	 */
	@GetMapping("/retornar-chamados-atrasados")
	@Operation(summary = "Retorna chamados atrasados", description = "Retorna a quantidade de chamados atrasados.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Indicador retornado com sucesso", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Map.class))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<Map<String, Object>> retornarChamadosAtrasados(){		
		return ResponseEntity.status(HttpStatus.OK).body(dashboardService.retornarTotalChamadosAtrasados());
	}

	/**
	 * Executa o metodo retornarChamadosAtendidosPorMim.
	 * @return resultado da operacao.
	 */
	@GetMapping("/retornar-chamados-atendidos-por-mim")
	@Operation(summary = "Retorna chamados atendidos por mim", description = "Retorna a quantidade de chamados atendidos pelo usuario autenticado.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Indicador retornado com sucesso", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Map.class))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<Map<String, Object>> retornarChamadosAtendidosPorMim(){		
		return ResponseEntity.status(HttpStatus.OK).body(dashboardService.retornarTotalChamadosAtendidosPorMim());
	}

	/**
	 * Executa o metodo retornarProdutosEmFalta.
	 * @return resultado da operacao.
	 */
	@GetMapping("/retornar-produtos-em-falta")
	@Operation(summary = "Retorna produtos em falta", description = "Retorna a quantidade de produtos abaixo do estoque minimo.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Indicador retornado com sucesso", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Map.class))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<Map<String, Object>> retornarProdutosEmFalta(){		
		return ResponseEntity.status(HttpStatus.OK).body(dashboardService.retornarProdutosEmFalta());
	}
	
	/**
	 * Executa o metodo retornarTotalPorMes.
	 * @return resultado da operacao.
	 */
	@GetMapping("/retornar-por-mes")
	@Operation(summary = "Retorna lucro por mes", description = "Retorna a serie mensal de lucros para exibicao no dashboard.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Serie retornada com sucesso", content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = LucroDTO.class)))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<List<LucroDTO>> retornarTotalPorMes(){		
		return ResponseEntity.status(HttpStatus.OK).body(dashboardService.retornarTotalLucrosPorMes());
	}

	/**
	 * Executa o metodo retornarVendasPorMes.
	 * @return resultado da operacao.
	 */
	@GetMapping("/retornar-vendas-por-mes")
	@Operation(summary = "Retorna vendas por mes", description = "Retorna a serie mensal de vendas para exibicao no dashboard.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Serie retornada com sucesso", content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = LucroDTO.class)))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<List<LucroDTO>> retornarVendasPorMes(){		
		return ResponseEntity.status(HttpStatus.OK).body(dashboardService.retornarTotalVendasPorMes());
	}
	
	/**
	 * Executa o metodo retornarProporcaoAtendimento.
	 * @return resultado da operacao.
	 */
	@GetMapping("/retornar-proporcao-atendimento")
	@Operation(summary = "Retorna proporcao de atendimentos", description = "Retorna a distribuicao de atendimentos por tipo.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Serie retornada com sucesso", content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = TipoAtendimentoDTO.class)))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<List<TipoAtendimentoDTO>> retornarProporcaoAtendimento(){		
		return ResponseEntity.status(HttpStatus.OK).body(dashboardService.retornarQuantidadeAtendimentosPorTipo());
	}

	/**
	 * Executa o metodo retornarContratosCalendario.
	 * @return resultado da operacao.
	 */
	@GetMapping("/retornar-contratos-calendario")
	@Operation(summary = "Retorna contratos do calendario", description = "Retorna os contratos para exibicao no calendario.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Eventos retornados com sucesso", content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = ContratoCalendarioDTO.class)))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<List<ContratoCalendarioDTO>> retornarContratosCalendario(){		
		return ResponseEntity.status(HttpStatus.OK).body(dashboardService.retornarContratosCalendario());
	}

	/**
	 * Executa o metodo retornarAgendaEventos.
	 * @return resultado da operacao.
	 */
	@GetMapping("/retornar-agenda-eventos")
	@Operation(summary = "Retorna eventos da agenda", description = "Retorna os eventos da agenda para exibicao no calendario.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Eventos retornados com sucesso", content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = AgendaEventoDTO.class)))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<List<AgendaEventoDTO>> retornarAgendaEventos(){		
		return ResponseEntity.status(HttpStatus.OK).body(dashboardService.retornarAgendaEventos());
	}
}

