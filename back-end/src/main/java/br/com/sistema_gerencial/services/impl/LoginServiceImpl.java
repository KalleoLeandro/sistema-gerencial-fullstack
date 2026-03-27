package br.com.sistema_gerencial.services.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.sistema_gerencial.exceptions.DefaultErrorException;
import br.com.sistema_gerencial.models.dto.LoginDTO;
import br.com.sistema_gerencial.models.requests.AtualizarLoginRequest;
import br.com.sistema_gerencial.models.requests.CadastroLoginRequest;
import br.com.sistema_gerencial.models.requests.LoginRequest;
import br.com.sistema_gerencial.models.response.ExecutorResponse;
import br.com.sistema_gerencial.models.response.LoginAtualizacaoResponse;
import br.com.sistema_gerencial.models.response.LoginResponse;
import br.com.sistema_gerencial.repositories.LoginRepository;
import br.com.sistema_gerencial.services.LoginService;
import br.com.sistema_gerencial.utils.GeralUtils;
import br.com.sistema_gerencial.utils.JwtUtils;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LoginServiceImpl implements LoginService {

	private final LoginRepository repository;
	private final GeralUtils geralUtils;
	private final JwtUtils jwtUtils;

	/**
	 * Executa o metodo validarLogin.
	 * @param request valor do parametro request.
	 * @return resultado da operacao.
	 */
	@Override
	@Transactional
	public LoginResponse validarLogin(LoginRequest request) {
		LoginDTO dto = repository.buscarPorLoginESenha(request.getLogin(), request.getSenha());
		LoginResponse response = new LoginResponse();
		if (dto != null) {
			response.setStatus(HttpStatus.OK);
			response.setUserName(dto.getNome());
			response.setPerfil(dto.getPerfil());
			response.setToken(jwtUtils.generateAccessToken(response.getUserName(), request.getLogin(), dto.getPerfil()));
			try {
				response.setExpiration(geralUtils.converterData(jwtUtils.getExpirationDateFromToken(response.getToken())));
			} catch (Exception e) {
				throw new DefaultErrorException("Erro ao gerar o token", HttpStatus.INTERNAL_SERVER_ERROR);
			}
			return response;
		}

		throw new DefaultErrorException("Login e/ou senha invalidos", HttpStatus.UNAUTHORIZED);
	}

	/**
	 * Executa o metodo atualizarToken.
	 * @param refreshToken valor do parametro refreshToken.
	 * @return resultado da operacao.
	 */
	@Override
	@Transactional
	public LoginResponse atualizarToken(String refreshToken) {
		try {
			if (refreshToken == null || refreshToken.isBlank() || !jwtUtils.validateRefreshToken(refreshToken)) {
				throw new DefaultErrorException("Refresh token invalido ou expirado.", HttpStatus.UNAUTHORIZED);
			}

			String login = jwtUtils.getLoginFromToken(refreshToken);
			String userName = jwtUtils.getUsernameFromToken(refreshToken);
			String perfil = jwtUtils.getRolesFromToken(refreshToken);

			LoginResponse response = new LoginResponse();
			response.setStatus(HttpStatus.OK);
			response.setUserName(userName);
			response.setPerfil(perfil);
			response.setToken(jwtUtils.generateAccessToken(userName, login, perfil));
			response.setExpiration(geralUtils.converterData(jwtUtils.getExpirationDateFromToken(response.getToken())));
			return response;
		} catch (DefaultErrorException e) {
			throw e;
		} catch (Exception e) {
			throw new DefaultErrorException("Erro ao atualizar o token.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Executa o metodo validarToken.
	 * @param token valor do parametro token.
	 * @return resultado da operacao.
	 */
	@Override
	@Transactional
	public boolean validarToken(String token) {
		try {
			if (token == null || token.isBlank()) {
				Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
				return authentication != null
						&& authentication.isAuthenticated()
						&& !(authentication instanceof AnonymousAuthenticationToken)
						&& authentication.getPrincipal() instanceof String principal
						&& !principal.isBlank()
						&& !"anonymousUser".equalsIgnoreCase(principal);
			}
			return jwtUtils.validateAccessToken(token);
		} catch (Exception e) {
			throw new DefaultErrorException("Erro na execucao da validacao do token", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Executa o metodo cadastrar.
	 * @param request valor do parametro request.
	 */
	@Override
	@Transactional
	public void cadastrar(CadastroLoginRequest request) {
		repository.cadastrarLogin(request);
	}

	/**
	 * Executa o metodo listarPorPagina.
	 * @param limit valor do parametro limit.
	 * @param page valor do parametro page.
	 * @return resultado da operacao.
	 */
	@Override
	@Transactional
	public Map<String, Object> listarPorPagina(int limit, int page) {
		return repository.listarPorPagina(limit, page);
	}

	/**
	 * Executa o metodo excluir.
	 * @param id valor do parametro id.
	 */
	@Override
	@Transactional
	public void excluir(int id) {
		repository.excluir(id);
	}

	/**
	 * Executa o metodo buscarPorId.
	 * @param id valor do parametro id.
	 * @return resultado da operacao.
	 */
	@Override
	@Transactional
	public LoginAtualizacaoResponse buscarPorId(int id) {
		return repository.buscarPorId(id);
	}

	/**
	 * Executa o metodo buscarPorNome.
	 * @param nome valor do parametro nome.
	 * @return resultado da operacao.
	 */
	@Override
	public List<ExecutorResponse> buscarPorNome(String nome) {
		return repository.buscarPorNome(nome);
	}

	/**
	 * Executa o metodo atualizar.
	 * @param request valor do parametro request.
	 */
	@Override
	@Transactional
	public void atualizar(AtualizarLoginRequest request) {
		repository.atualizar(request);
	}

	/**
	 * Executa o metodo retornarPerfil.
	 * @return resultado da operacao.
	 */
	@Override
	public Map<String, String> retornarPerfil() {
		try {
			Map<String, String> map = new HashMap<>();
			Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
			String role = authentication.getAuthorities().stream()
					.findFirst()
					.map(authority -> authority.getAuthority().replace("ROLE_", ""))
					.orElse("");
			map.put("role", role);
			return map;
		} catch (Exception e) {
			throw new DefaultErrorException("Erro ao retornar os papeis", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Executa o metodo buscarPorToken.
	 * @return resultado da operacao.
	 */
	@Override
	public ExecutorResponse buscarPorToken() {
		try {
			String login = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
			return repository.buscarPorLogin(login);
		} catch (Exception e) {
			throw new DefaultErrorException("Erro ao retornar o executor logado", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Executa o metodo listarTodos.
	 * @return resultado da operacao.
	 */
	@Override
	public List<ExecutorResponse> listarTodos() {
		return repository.listarTodos();
	}
}

