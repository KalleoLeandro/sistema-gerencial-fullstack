package br.com.sistema_gerencial.utils;

import static org.assertj.core.api.Assertions.*;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.*;

class GeralUtilsTest {
    final GeralUtils utils=new GeralUtils();
    @Test void dataFormatadaSemDependerDoDiaAtual() {
        var calendar=new GregorianCalendar(2026,Calendar.OCTOBER,13);
        assertThat(utils.converterData(calendar.getTime())).isEqualTo("13/10/2026");
        assertThat(utils.converterData(null)).isEmpty();
        assertThat(utils.converterDataPorTexto("2026-10-13")).isEqualTo("13-10-2026");
    }
    @ParameterizedTest @NullAndEmptySource @ValueSource(strings={"invalida","2026"})
    void textoInvalidoNaoQuebraFormatacao(String input) { assertThat(utils.converterDataPorTexto(input)).isEmpty(); }
    @Test void validaCpfRealSemMockDoValidador() {
        assertThat(utils.isCpfInvalido("52998224725")).isFalse();
        assertThat(utils.isCpfInvalido("11111111111")).isTrue();
        assertThat(utils.isCpfInvalido(null)).isTrue();
    }
    @Test void serializacaoJsonSucessoEErro() {
        assertThat(utils.convertToJson(Map.of("nome","Ana"))).isEqualTo("{\"nome\":\"Ana\"}");
        assertThat(utils.convertToJson(null)).isEqualTo("null");
        assertThatThrownBy(()->utils.convertToJson(new Object())).hasMessage("Erro ao converter objeto para JSON");
    }
}
