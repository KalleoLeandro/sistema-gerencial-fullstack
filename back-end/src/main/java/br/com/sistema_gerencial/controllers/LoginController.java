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
import br.com.sistema_gerencial.models.requests.AtualizarLoginRequest;
import br.com.sistema_gerencial.models.requests.CadastroLoginRequest;
import br.com.sistema_gerencial.models.requests.LoginRequest;
import br.com.sistema_gerencial.models.response.ExecutorResponse;
import br.com.sistema_gerencial.models.response.LoginAtualizacaoResponse;
import br.com.sistema_gerencial.models.response.LoginResponse;
import br.com.sistema_gerencial.services.LoginService;
import br.com.sistema_gerencial.utils.AuthCookieUtils;
import br.com.sistema_gerencial.utils.JwtUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

/**
 * Expõe os endpoints HTTP de usuários e autenticação e delega as operações à camada de serviço.
 */
@RestController
@RequestMapping("/login")
@RequiredArgsConstructor
@Tag(name = "Login", description = "Endpoints de autenticacao e gerenciamento de usuarios")
public class LoginController {

	private final LoginService loginService;
	private final JwtUtils jwtUtils;
	private final AuthCookieUtils authCookieUtils;

	/**
	 * Executa o metodo validarLogin.
	 * @param login valor do parametro login.
	 * @param response valor do parametro response.
	 * @return resultado da operacao.
	 */
	@PostMapping("/validar-login")
	@Operation(summary = "Faz login do usuario", description = "Verifica login e senha e retorna os dados da sessao quando as credenciais sao validas.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Login bem-sucedido", content = @Content(mediaType = "application/json", schema = @Schema(implementation = LoginResponse.class))),
			@ApiResponse(responseCode = "400", description = "Requisicao invalida", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
			@ApiResponse(responseCode = "401", description = "Login ou senha invalidos", content = @Content),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<LoginResponse> validarLogin(@RequestBody LoginRequest login, HttpServletResponse response) {
		LoginResponse loginResponse = loginService.validarLogin(login);
		String refreshToken = jwtUtils.generateRefreshToken(loginResponse.getUserName(), login.getLogin(),
				loginResponse.getPerfil());
		authCookieUtils.writeAuthCookies(response, loginResponse.getToken(), refreshToken);
		loginResponse.setToken(null);
		return ResponseEntity.status(loginResponse.getStatus()).body(loginResponse);
	}

	/**
	 * Executa o metodo refresh.
	 * @param request valor do parametro request.
	 * @param response valor do parametro response.
	 * @return resultado da operacao.
	 * @throws Exception em caso de falha na execucao.
	 */
	@PostMapping("/refresh")
	@Operation(summary = "Renova a sessao do usuario", description = "Utiliza o refresh token presente no cookie para gerar um novo token de acesso.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Token renovado com sucesso", content = @Content(mediaType = "application/json", schema = @Schema(implementation = LoginResponse.class))),
			@ApiResponse(responseCode = "401", description = "Refresh token invalido ou expirado", content = @Content),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<LoginResponse> refresh(HttpServletRequest request, HttpServletResponse response) throws Exception {
		String refreshTokenAtual = jwtUtils.resolveRefreshToken(request);
		LoginResponse loginResponse = loginService.atualizarToken(refreshTokenAtual);
		String login = jwtUtils.getLoginFromToken(refreshTokenAtual);
		String novoRefreshToken = jwtUtils.generateRefreshToken(loginResponse.getUserName(), login,
				loginResponse.getPerfil());
		authCookieUtils.writeAuthCookies(response, loginResponse.getToken(), novoRefreshToken);
		loginResponse.setToken(null);
		return ResponseEntity.ok(loginResponse);
	}

	/**
	 * Executa o metodo logout.
	 * @param response valor do parametro response.
	 * @return resultado da operacao.
	 */
	@PostMapping("/logout")
	@Operation(summary = "Encerra a sessao do usuario", description = "Remove os cookies de autenticacao da resposta.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "204", description = "Logout realizado com sucesso", content = @Content),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<Void> logout(HttpServletResponse response) {
		authCookieUtils.clearAuthCookies(response);
		return ResponseEntity.noContent().build();
	}

	/**
	 * Executa o metodo validarToken.
	 * @param request valor do parametro request.
	 * @return resultado da operacao.
	 */
	@PostMapping("/validar-token")
	@Operation(summary = "Valida o token de acesso", description = "Verifica se o token JWT enviado na requisicao ainda esta valido.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Token validado com sucesso", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Boolean.class))),
			@ApiResponse(responseCode = "401", description = "Token invalido ou expirado", content = @Content),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<Boolean> validarToken(HttpServletRequest request) {
		return ResponseEntity.ok(loginService.validarToken(jwtUtils.resolveToken(request)));
	}

	/**
	 * Executa o metodo buscarPorToken.
	 * @return resultado da operacao.
	 */
	@GetMapping("/buscar-por-token")
	@Operation(summary = "Busca o usuario autenticado", description = "Retorna os dados do usuario com base no token da sessao atual.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Usuario retornado com sucesso", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ExecutorResponse.class))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<ExecutorResponse> buscarPorToken() {
		return ResponseEntity.ok(loginService.buscarPorToken());
	}

	/**
	 * Executa o metodo cadastrarLogin.
	 * @param request valor do parametro request.
	 * @return resultado da operacao.
	 */
	@PreAuthorize("hasAnyRole('ADMIN', 'DEV')")
	@PostMapping("/cadastrar")
	@Operation(summary = "Cadastra um usuario", description = "Cria um novo usuario no sistema.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "201", description = "Usuario cadastrado com sucesso", content = @Content),
			@ApiResponse(responseCode = "400", description = "Requisicao invalida", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "403", description = "Usuario sem permissao para cadastrar", content = @Content),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<Void> cadastrarLogin(@RequestBody CadastroLoginRequest request) {
		loginService.cadastrar(request);
		return ResponseEntity.status(HttpStatus.CREATED).build();
	}

	/**
	 * Executa o metodo listarPorPagina.
	 * @param limit valor do parametro limit.
	 * @param page valor do parametro page.
	 * @return resultado da operacao.
	 */
	@GetMapping("/listar")
	@Operation(summary = "Lista usuarios paginados", description = "Retorna os usuarios cadastrados com paginacao.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Usuarios listados com sucesso", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Map.class))),
			@ApiResponse(responseCode = "400", description = "Parametros de paginacao invalidos", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<Map<String, Object>> listarPorPagina(@RequestParam Integer limit, @RequestParam Integer page) {
		return ResponseEntity.status(HttpStatus.OK).body(loginService.listarPorPagina(limit, page));
	}

	/**
	 * Executa o metodo listarPorPagina.
	 * @return resultado da operacao.
	 */
	@GetMapping("/listar-todos")
	@Operation(summary = "Lista todos os usuarios", description = "Retorna todos os usuarios executores sem paginacao.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Usuarios listados com sucesso", content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = ExecutorResponse.class)))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<List<ExecutorResponse>> listarPorPagina() {
		return ResponseEntity.status(HttpStatus.OK).body(loginService.listarTodos());
	}

	/**
	 * Executa o metodo buscarPorId.
	 * @param id valor do parametro id.
	 * @return resultado da operacao.
	 */
	@PreAuthorize("hasAnyRole('ADMIN', 'DEV')")
	@GetMapping("/buscar-por-id/{id}")
	@Operation(summary = "Busca usuario por id", description = "Retorna os dados de um usuario especifico para edicao.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Usuario encontrado com sucesso", content = @Content(mediaType = "application/json", schema = @Schema(implementation = LoginAtualizacaoResponse.class))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "403", description = "Usuario sem permissao para consultar", content = @Content),
			@ApiResponse(responseCode = "404", description = "Usuario nao encontrado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<LoginAtualizacaoResponse> buscarPorId(@PathVariable int id) {
		return ResponseEntity.status(HttpStatus.OK).body(loginService.buscarPorId(id));
	}

	/**
	 * Executa o metodo buscarPorId.
	 * @param nome valor do parametro nome.
	 * @return resultado da operacao.
	 */
	@GetMapping("/buscar-por-nome")
	@Operation(summary = "Busca usuarios por nome", description = "Retorna os usuarios que correspondem ao nome informado.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Usuarios encontrados com sucesso", content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = ExecutorResponse.class)))),
			@ApiResponse(responseCode = "400", description = "Parametro de busca invalido", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<List<ExecutorResponse>> buscarPorId(@RequestParam String nome) {
		return ResponseEntity.status(HttpStatus.OK).body(loginService.buscarPorNome(nome));
	}

	/**
	 * Executa o metodo atualizar.
	 * @param request valor do parametro request.
	 * @return resultado da operacao.
	 */
	@PreAuthorize("hasAnyRole('ADMIN', 'DEV')")
	@PutMapping("/atualizar")
	@Operation(summary = "Atualiza um usuario", description = "Atualiza os dados de um usuario existente.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "204", description = "Usuario atualizado com sucesso", content = @Content),
			@ApiResponse(responseCode = "400", description = "Requisicao invalida", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "403", description = "Usuario sem permissao para atualizar", content = @Content),
			@ApiResponse(responseCode = "404", description = "Usuario nao encontrado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<Void> atualizar(@RequestBody AtualizarLoginRequest request) {
		loginService.atualizar(request);
		return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	}

	/**
	 * Executa o metodo excluirPorId.
	 * @param id valor do parametro id.
	 * @return resultado da operacao.
	 */
	@PreAuthorize("hasAnyRole('ADMIN', 'DEV')")
	@DeleteMapping("/excluir/{id}")
	@Operation(summary = "Exclui um usuario", description = "Remove um usuario do sistema pelo identificador.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "204", description = "Usuario excluido com sucesso", content = @Content),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "403", description = "Usuario sem permissao para excluir", content = @Content),
			@ApiResponse(responseCode = "404", description = "Usuario nao encontrado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<Void> excluirPorId(@PathVariable int id) {
		loginService.excluir(id);
		return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	}

	/**
	 * Executa o metodo retornarPapeis.
	 * @return resultado da operacao.
	 */
	@GetMapping("/retorna-perfil")
	@Operation(summary = "Retorna o perfil do usuario", description = "Retorna os papeis do usuario autenticado.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Perfil retornado com sucesso", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Map.class))),
			@ApiResponse(responseCode = "401", description = "Sessao invalida ou expirada", content = @Content),
			@ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DefaultErrorResponse.class))) })
	public ResponseEntity<Map<String, String>> retornarPapeis() {
		return ResponseEntity.status(HttpStatus.OK).body(loginService.retornarPerfil());
	}
}

