package br.com.sistema_gerencial.models.requests;

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
public class CadastrarEquipamentoRequest {	
	
	private String nome_maquina;
	private String setor;
	private String tipo_equipamento;
	private String placa_mae;
	private String marca;
	private String modelo;
	private String numero_serie;
	private String processador;
	private String memoria;
	private String hd_ssd;
	private String fonte;
	private String gabinete;
	private int id_empresa;
	private String observacoes;
}


