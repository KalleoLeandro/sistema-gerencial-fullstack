package br.com.sistema_gerencial.models.requests;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class AtualizarEmpresaRequest {
	private int id;
	private String nome_fantasia;
	private String razao_social;
	private String cnpj;
	private String inscricao;	
	@JsonFormat(pattern = "dd/MM/yyyy HH:mm")
	private LocalDateTime data_inicio;
	@JsonFormat(pattern = "dd/MM/yyyy HH:mm")
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

