package br.com.sistema_gerencial.services;

import java.util.List;

import br.com.sistema_gerencial.models.response.ClienteResponse;

/**
 * Define o contrato das operações de negócio de clientes.
 */
public interface ClienteService {

	/**
	 * Localiza um cliente pelo documento cadastrado.
	 *
	 * @param documento documento do cliente
	 * @return cliente correspondente ao documento
	 */
	ClienteResponse buscarPorDocumento(String documento);

	/**
	 * Pesquisa clientes por nome ou documento.
	 *
	 * @param termo termo pesquisado no nome ou documento
	 * @return clientes correspondentes ao termo pesquisado
	 */
	List<ClienteResponse> buscarPorNomeOuDocumento(String termo);
}
