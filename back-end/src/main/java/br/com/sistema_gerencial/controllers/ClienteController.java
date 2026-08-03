package br.com.sistema_gerencial.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.sistema_gerencial.models.response.ClienteResponse;
import br.com.sistema_gerencial.services.ClienteService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/clientes")
@RequiredArgsConstructor
public class ClienteController {

	private final ClienteService clienteService;

	@GetMapping("/buscar-por-documento")
	public ResponseEntity<ClienteResponse> buscarPorDocumento(@RequestParam String documento) {
		ClienteResponse cliente = clienteService.buscarPorDocumento(documento);
		if (cliente == null) {
			return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
		}
		return ResponseEntity.status(HttpStatus.OK).body(cliente);
	}

	@GetMapping("/buscar")
	public ResponseEntity<List<ClienteResponse>> buscarPorNomeOuDocumento(@RequestParam String termo) {
		List<ClienteResponse> clientes = clienteService.buscarPorNomeOuDocumento(termo);
		if (clientes == null || clientes.isEmpty()) {
			return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
		}
		return ResponseEntity.status(HttpStatus.OK).body(clientes);
	}
}
