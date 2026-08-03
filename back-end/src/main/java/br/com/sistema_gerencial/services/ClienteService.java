package br.com.sistema_gerencial.services;

import java.util.List;

import br.com.sistema_gerencial.models.response.ClienteResponse;

public interface ClienteService {

	ClienteResponse buscarPorDocumento(String documento);

	List<ClienteResponse> buscarPorNomeOuDocumento(String termo);
}
