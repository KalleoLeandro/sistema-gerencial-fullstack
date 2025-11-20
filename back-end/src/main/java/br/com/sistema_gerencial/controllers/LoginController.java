package br.com.sistema_gerencial.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.sistema_gerencial.exceptions.schemas.DefaultErrorResponse;
import br.com.sistema_gerencial.models.requests.LoginRequest;
import br.com.sistema_gerencial.models.responses.LoginResponse;
import br.com.sistema_gerencial.services.LoginService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Login", description = "Endpoints de login e token")
@RestController
@RequestMapping("/login")
@RequiredArgsConstructor
public class LoginController {

	private static final Logger logger = LoggerFactory.getLogger(LoginController.class);
	
	private final LoginService loginService;

	@Operation(summary = "Faz login do usuário", description = "Verifica login e senha e retorna o token JWT se for válido")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Login bem-sucedido", content = @Content(mediaType = "application/json", schema = @Schema(implementation = LoginResponse.class))),
			@ApiResponse(responseCode = "400", description = "Requisição inválida", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))),
			@ApiResponse(responseCode = "401", description = "Login ou senha inválidos", content = @Content),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	@PostMapping("/validar-login")
	public ResponseEntity<LoginResponse> validarLogin(@RequestBody @Valid LoginRequest login) {
		logger.info("Executando a LoginService.validarLogin");
		LoginResponse response = loginService.validarLogin(login);
		return ResponseEntity.status(response.getStatus()).body(response);
	}

	@Operation(summary = "Faz a validação do token", description = "Verifica se o token JWT é válido")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Retorna true ou false", content = @Content(mediaType = "application/json", schema = @Schema(type = "boolean", example = "true"))),
			@ApiResponse(responseCode = "400", description = "Requisição inválida", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class), examples = @ExampleObject(value = "{\"timestamp\": \"2025-04-19T15:30:00\", \"message\": \"Token JWT não encontrado no header\", \"status\": 400}"))),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	@PostMapping("/validar-token")
	public ResponseEntity<Boolean> validarToken(@RequestHeader("Authorization") String token) {
		logger.info("Executando a LoginService.validarToken");
		return ResponseEntity.ok(loginService.validarToken(token));
	}
}