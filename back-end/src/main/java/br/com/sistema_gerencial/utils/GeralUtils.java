package br.com.sistema_gerencial.utils;

import java.text.SimpleDateFormat;
import java.util.Date;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

import br.com.caelum.stella.validation.CPFValidator;

/**
 * Reúne validações e conversões compartilhadas pelos serviços do sistema.
 */
@Component
public class GeralUtils {

	/**
	 * Executa o metodo isCpfInvalido.
	 * @param args valor do parametro args.
	 * @return resultado da operacao.
	 */
	public boolean isCpfInvalido(String args) {
		CPFValidator cpfValidator = new CPFValidator();
		try {
			cpfValidator.assertValid(args);
			return false;
		} catch (Exception e) {
			return true;
		}
	}

	/**
	 * Executa o metodo converterData.
	 * @param data valor do parametro data.
	 * @return resultado da operacao.
	 */
	public String converterData(Date data) {
		try {
			String formatoDeDestino = "dd/MM/yyyy";
			SimpleDateFormat sdfDestino = new SimpleDateFormat(formatoDeDestino);
			return sdfDestino.format(data);
		} catch (Exception e) {
			return "";
		}
	}

	/**
	 * Executa o metodo converterDataPorTexto.
	 * @param data valor do parametro data.
	 * @return resultado da operacao.
	 */
	public String converterDataPorTexto(String data) {
		try {
			String[] dataParcial = data.split("-");
			return dataParcial[2] + "-" + dataParcial[1] + "-" + dataParcial[0];
		} catch (Exception e) {
			return "";
		}
	}

	/**
	 * Executa o metodo convertToJson.
	 * @param obj valor do parametro obj.
	 * @return resultado da operacao.
	 */
	public String convertToJson(Object obj) {
		try {
			return new ObjectMapper().writeValueAsString(obj);
		} catch (Exception e) {
			throw new RuntimeException("Erro ao converter objeto para JSON", e);
		}
	}
}

