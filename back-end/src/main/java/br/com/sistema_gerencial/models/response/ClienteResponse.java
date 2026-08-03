package br.com.sistema_gerencial.models.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class ClienteResponse {

	private int id;
	private String nome;
	private String documento;
	private String cep;
	private String endereco;
	private Integer numero;
	private String complemento;
	private String bairro;
	private String cidade;
	private String uf;
	private String telefone;
	private String celular;
	private String email;
	private String contato;
	private LocalDateTime criado_em;
	private LocalDateTime atualizado_em;
}
