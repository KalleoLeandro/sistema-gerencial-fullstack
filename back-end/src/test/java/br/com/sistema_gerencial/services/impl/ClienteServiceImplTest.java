package br.com.sistema_gerencial.services.impl;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.util.List;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.*;
import br.com.sistema_gerencial.models.response.ClienteResponse;
import br.com.sistema_gerencial.repositories.ClienteRepository;

class ClienteServiceImplTest {
    ClienteRepository repository=mock(ClienteRepository.class);
    ClienteServiceImpl service=new ClienteServiceImpl(repository);
    @ParameterizedTest @NullAndEmptySource @ValueSource(strings={" "})
    void pesquisaVaziaNaoConsultaBanco(String value) {
        assertThat(service.buscarPorDocumento(value)).isNull(); assertThat(service.buscarPorNomeOuDocumento(value)).isEmpty();
        verifyNoInteractions(repository);
    }
    @Test void documentoFormatadoPriorizaCorrespondenciaExata() {
        var result=ClienteResponse.builder().id(1).nome("Ana").build();
        when(repository.buscarPorDocumentoNormalizado("52998224725")).thenReturn(result);
        assertThat(service.buscarPorDocumento("529.982.247-25")).isSameAs(result);
        assertThat(service.buscarPorNomeOuDocumento(" 529.982.247-25 ")).containsExactly(result);
        verify(repository,never()).buscarPorNome(any());
    }
    @Test void nomeEDocumentoNaoEncontradoUsamPesquisaPorNome() {
        var result=ClienteResponse.builder().id(1).nome("Ana").build(); when(repository.buscarPorNome("Ana")).thenReturn(List.of(result));
        assertThat(service.buscarPorNomeOuDocumento(" Ana ")).containsExactly(result);
        assertThat(service.buscarPorNomeOuDocumento("123")).isEmpty(); verify(repository).buscarPorNome("123");
        assertThat(service.buscarPorDocumento("abc")).isNull();
    }
}
