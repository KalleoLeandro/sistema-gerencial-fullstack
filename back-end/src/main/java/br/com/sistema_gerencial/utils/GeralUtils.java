package br.com.sistema_gerencial.utils; 

import java.text.SimpleDateFormat;
import java.util.Date;

import org.springframework.stereotype.Component;

import br.com.caelum.stella.validation.CPFValidator;

@Component
public class GeralUtils {

	public boolean isCpfInvalido(String args) {
		CPFValidator cpfValidator = new CPFValidator();
		try {
			cpfValidator.assertValid(args);
			return false;
		} catch (Exception e) {
			return true;
		}
	}

	public String converterData(Date data) {
		try {
			String formatoDeDestino = "dd/MM/yyyy";
			SimpleDateFormat sdfDestino = new SimpleDateFormat(formatoDeDestino);
			String dataFormatada = sdfDestino.format(data);
			return dataFormatada;
		} catch (Exception e) {
			return "";
		}
	}

	public String converterDataPorTexto(String data) {
		try {
			String[] dataParcial = data.split("-");
			return dataParcial[2] + "-" + dataParcial[1] + "-" + dataParcial[0];
		} catch (Exception e) {
			return "";
		}
	}
}
