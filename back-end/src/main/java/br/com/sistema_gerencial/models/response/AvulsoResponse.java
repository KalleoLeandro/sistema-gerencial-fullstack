package br.com.sistema_gerencial.models.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Transporta os dados de avulso retornados pela API.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class AvulsoResponse {	
	private int id;
	private String nome_cliente;	
	private LocalDateTime data_inicio;	
    private LocalDateTime data_fim;
	private String tipo_pessoa;
    private String cpf_cnpj;
    private String ie;
    private String razao_social;
    private String tipo_atendimento;
    private String executores;    
    private String descricao;
    private String observacoes;
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
    private int status_atendimento;
    private String motivo_cancelamento;
    private int deslocamento;
    private double valor_deslocamento;
    private double total;
}

