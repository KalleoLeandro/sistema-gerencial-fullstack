package br.com.sistema_gerencial.models.requests;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Transporta os dados de entrada para cadastrar avulso na API.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class CadastrarAvulsoRequest {

	private String nome_cliente;
	@JsonFormat(pattern = "dd/MM/yyyy HH:mm")
	private LocalDateTime data_inicio;
	@JsonFormat(pattern = "dd/MM/yyyy HH:mm")
    private LocalDateTime data_fim;
	private String tipo_pessoa;
    private String cpf_cnpj;
    private String ie;
    private String razao_social;
    private String tipo_atendimento;
    private String executores;
    private String descricao;
    private double valor_servico;
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
    private int deslocamento;
    private double valor_deslocamento;
    private double total;
    private String observacoes;
}

