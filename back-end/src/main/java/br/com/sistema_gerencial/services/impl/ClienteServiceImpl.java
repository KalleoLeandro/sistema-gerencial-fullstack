package br.com.sistema_gerencial.services.impl;

import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.sistema_gerencial.models.response.ClienteResponse;
import br.com.sistema_gerencial.repositories.ClienteRepository;
import br.com.sistema_gerencial.services.ClienteService;
import lombok.RequiredArgsConstructor;

/**
 * Implementa as regras de negócio e a coordenação da persistência de clientes.
 */
@Service
@RequiredArgsConstructor
public class ClienteServiceImpl implements ClienteService {

	private final ClienteRepository clienteRepository;

	@Override
	@Transactional(readOnly = true)
	public ClienteResponse buscarPorDocumento(String documento) {
		String documentoNormalizado = normalizarDocumento(documento);
		if (documentoNormalizado == null) {
			return null;
		}
		return clienteRepository.buscarPorDocumentoNormalizado(documentoNormalizado);
	}

	@Override
	@Transactional(readOnly = true)
	public List<ClienteResponse> buscarPorNomeOuDocumento(String termo) {
		String valor = blankToNull(termo);
		if (valor == null) {
			return Collections.emptyList();
		}

		String documentoNormalizado = normalizarDocumento(valor);
		if (documentoNormalizado != null) {
			ClienteResponse cliente = clienteRepository.buscarPorDocumentoNormalizado(documentoNormalizado);
			if (cliente != null) {
				return List.of(cliente);
			}
		}

		return clienteRepository.buscarPorNome(valor);
	}

	private String blankToNull(String valor) {
		if (valor == null || valor.trim().isEmpty()) {
			return null;
		}
		return valor.trim();
	}

	private String normalizarDocumento(String documento) {
		String valor = blankToNull(documento);
		if (valor == null) {
			return null;
		}
		String apenasDigitos = valor.replaceAll("\\D", "");
		return apenasDigitos.isEmpty() ? null : apenasDigitos;
	}
}
