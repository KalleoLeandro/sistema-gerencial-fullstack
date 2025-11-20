package br.com.sistema_gerencial.services;

import br.com.sistema_gerencial.models.requests.LoginRequest;
import br.com.sistema_gerencial.models.responses.LoginResponse;

public interface LoginService {
	
	public LoginResponse validarLogin(LoginRequest loginRequest);

	public Boolean validarToken(String token);
	
}

