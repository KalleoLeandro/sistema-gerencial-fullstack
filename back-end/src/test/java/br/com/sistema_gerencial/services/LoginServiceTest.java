package br.com.sistema_gerencial.services;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;

import java.util.Date;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import br.com.sistema_gerencial.exceptions.DefaultErrorException;
import br.com.sistema_gerencial.models.dto.LoginDTO;
import br.com.sistema_gerencial.models.requests.LoginRequest;
import br.com.sistema_gerencial.models.responses.LoginResponse;
import br.com.sistema_gerencial.repositories.LoginRepository;
import br.com.sistema_gerencial.services.impl.LoginServiceImpl;
import br.com.sistema_gerencial.utils.GeralUtils;
import br.com.sistema_gerencial.utils.JwtUtils;

@SpringBootTest
@TestPropertySource(properties = { "jwt.token.validity=10000", "secret.jwt.secret=myTestSecretKey" })
@ActiveProfiles("test")
class LoginServiceImplTest {	
	@InjectMocks
	private LoginServiceImpl loginService;

	@Mock
	private LoginRepository loginRepository;

	@Mock
	private JwtUtils jwtUtils;

	@Mock
	private GeralUtils geralUtils;

	@BeforeEach
	public void setup() {		
		
		loginService = new LoginServiceImpl(loginRepository, geralUtils, jwtUtils);
	}	

	@BeforeEach
	void setUp() {
		MockitoAnnotations.openMocks(this);
	}

	@Test
	void deveValidarLoginComSucesso() throws Exception {
		LoginRequest request = new LoginRequest("usuario-teste", "123");
		LoginDTO dto = new LoginDTO();
		dto.setNome("Usuário Teste");
		dto.setPerfil("ROLE_USER");

		Mockito.when(loginRepository.buscarPorLoginESenha("usuario-teste", "123")).thenReturn(dto);
		Mockito.when(jwtUtils.generateToken(anyString(), anyString(), anyString())).thenReturn("token-abc");
		Mockito.when(jwtUtils.getExpirationDateFromToken("token-abc")).thenReturn(new Date());
		Mockito.when(geralUtils.converterData(any())).thenReturn("01/01/2000");
		LoginResponse response = loginService.validarLogin(request);

		Assertions.assertEquals(HttpStatus.OK, response.getStatus());
		Assertions.assertEquals("Usuário Teste", response.getUserName());
		Assertions.assertEquals("token-abc", response.getToken());
		Assertions.assertNotNull(response.getExpiration());

		Mockito.verify(loginRepository).buscarPorLoginESenha("usuario-teste", "123");
		Mockito.verify(jwtUtils).generateToken("Usuário Teste", "usuario-teste", "ROLE_USER");
	}

	@Test
	void deveValidarLoginComPerfilAdmin() throws Exception {
		LoginRequest request = new LoginRequest("admin-teste", "123");
		LoginDTO dto = new LoginDTO();
		dto.setNome("Admin Teste");
		dto.setPerfil("ROLE_ADMIN");

		Mockito.when(loginRepository.buscarPorLoginESenha("admin-teste", "123")).thenReturn(dto);
		Mockito.when(jwtUtils.generateToken(anyString(), anyString(), anyString())).thenReturn("token-abc");
		Mockito.when(jwtUtils.getExpirationDateFromToken("token-abc")).thenReturn(new Date());
		Mockito.when(geralUtils.converterData(any())).thenReturn("01/01/2000");
		LoginResponse response = loginService.validarLogin(request);

		Assertions.assertEquals(HttpStatus.OK, response.getStatus());
		Assertions.assertEquals("Admin Teste", response.getUserName());
		Assertions.assertEquals("token-abc", response.getToken());
		Assertions.assertNotNull(response.getExpiration());

		Mockito.verify(loginRepository).buscarPorLoginESenha("admin-teste", "123");
		Mockito.verify(jwtUtils).generateToken("Admin Teste", "admin-teste", "ROLE_ADMIN");
	}

	@Test
	void deveValidarLoginComPerfilDev() throws Exception {
		LoginRequest request = new LoginRequest("dev-teste", "123");
		LoginDTO dto = new LoginDTO();
		dto.setNome("Dev Teste");
		dto.setPerfil("ROLE_DEV");

		Mockito.when(loginRepository.buscarPorLoginESenha("dev-teste", "123")).thenReturn(dto);
		Mockito.when(jwtUtils.generateToken(anyString(), anyString(), anyString())).thenReturn("token-abc");
		Mockito.when(jwtUtils.getExpirationDateFromToken("token-abc")).thenReturn(new Date());
		Mockito.when(geralUtils.converterData(any())).thenReturn("01/01/2000");

		LoginResponse response = loginService.validarLogin(request);

		Assertions.assertEquals(HttpStatus.OK, response.getStatus());
		Assertions.assertEquals("Dev Teste", response.getUserName());
		Assertions.assertEquals("token-abc", response.getToken());
		Assertions.assertNotNull(response.getExpiration());

		Mockito.verify(loginRepository).buscarPorLoginESenha("dev-teste", "123");
		Mockito.verify(jwtUtils).generateToken("Dev Teste", "dev-teste", "ROLE_DEV");
	}

	@Test
	void deveRetornarNaoAutorizadoQuandoLoginInvalido() {
		LoginRequest request = new LoginRequest("usuario-invalido", "senha-invalida");

		Mockito.when(loginRepository.buscarPorLoginESenha("usuario-invalido", "senha-invalida")).thenReturn(null);

		LoginResponse response = loginService.validarLogin(request);
		Assertions.assertEquals(HttpStatus.UNAUTHORIZED, response.getStatus());
	}

	@Test
	void deveLançarExceçãoAoFalharBuscarLogin() {
		LoginRequest request = new LoginRequest("usuario123", "123");

		Mockito.when(loginRepository.buscarPorLoginESenha(anyString(), anyString()))
				.thenThrow(new RuntimeException("Erro"));

		DefaultErrorException exception = Assertions.assertThrows(DefaultErrorException.class, () -> {
			loginService.validarLogin(request);
		});
		Assertions.assertEquals("Erro na execução da validação do login", exception.getMessage());
		Assertions.assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, exception.getStatus());
	}

	@Test
	void deveValidarTokenComSucesso() {
		Mockito.when(jwtUtils.validateToken("token-valido")).thenReturn(true);

		boolean valido = loginService.validarToken("token-valido");

		Assertions.assertTrue(valido);
	}

	@Test
	void deveValidarTokenComSucessoMasFalso() {
		Mockito.when(jwtUtils.validateToken("token-invalido")).thenReturn(false);

		boolean valido = loginService.validarToken("token-invalido");

		Assertions.assertFalse(valido);
	}

	@Test
	void deveRetornarFalseQuandoTokenForVazio() {
		boolean valido = loginService.validarToken("");
		Assertions.assertFalse(valido);
	}

	@Test
	void deveLancarExcecaoQuandoErroAoValidarToken() {
		Mockito.when(jwtUtils.validateToken("token-invalido")).thenThrow(new RuntimeException("Erro"));

		DefaultErrorException exception = Assertions.assertThrows(DefaultErrorException.class, () -> {
			loginService.validarToken("token-invalido");
		});

		Assertions.assertEquals("Erro na execução da validação do token", exception.getMessage());
		Assertions.assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, exception.getStatus());
	}
}
