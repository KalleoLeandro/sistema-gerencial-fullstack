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
public class EmpresaResponse {

	private int id;
	private String nome_fantasia;
	private String razao_social;
	private String cnpj;
	private String inscricao;
	private String infraestrutura;	
	private LocalDateTime data_inicio;	
    private LocalDateTime data_fim;
	private String cep;
	private String endereco;
	private int numero;
	private String complemento;
	private String bairro;
	private String cidade;
	private String uf;
	private String telefone;
	private String celular;
	private String email;
	private String contato;

}

