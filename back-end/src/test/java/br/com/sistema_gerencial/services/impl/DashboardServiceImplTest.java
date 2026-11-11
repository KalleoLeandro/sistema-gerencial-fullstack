package br.com.sistema_gerencial.services.impl;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.util.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import br.com.sistema_gerencial.repositories.*;
import br.com.sistema_gerencial.models.response.ExecutorResponse;
import br.com.sistema_gerencial.models.dto.*;

class DashboardServiceImplTest {
    DashboardRepository repository=mock(DashboardRepository.class); LoginRepository login=mock(LoginRepository.class);
    DashboardServiceImpl service=new DashboardServiceImpl(repository,login);
    @AfterEach void cleanup() { SecurityContextHolder.clearContext(); }
    @Test void adminConsultaAgregacoesGlobais() {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("admin",null,List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))));
        var income=LucroDTO.builder().mes("outubro").valor(100).build(); var type=TipoAtendimentoDTO.builder().tipo("REMOTO").quantidade(2).build();
        when(repository.retornarTotalPorMes()).thenReturn(List.of(income)); when(repository.retornarQuantidadeAtendimentoPorTipo()).thenReturn(List.of(type));
        assertThat(service.retornarTotalLucrosPorMes()).containsExactly(income);
        assertThat(service.retornarQuantidadeAtendimentosPorTipo()).containsExactly(type);
        verify(repository,never()).retornarTotalChamadosPorMesPorExecutor(any()); verifyNoInteractions(login);
    }
    @ParameterizedTest @ValueSource(strings={"found","missing","anonymous","blank","nonString"})
    void usuarioConsultaSomenteSeusChamados(String mode) {
        String expected="";
        if(!mode.equals("anonymous")) {
            Object principal=mode.equals("nonString")?123:mode.equals("blank")?" ":"ana";
            SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(principal,null,List.of(new SimpleGrantedAuthority("ROLE_USER"))));
            if(mode.equals("found")) { when(login.buscarPorLogin("ana")).thenReturn(ExecutorResponse.builder().nome("Ana").build()); expected="Ana"; }
            if(mode.equals("missing")) { when(login.buscarPorLogin("ana")).thenThrow(new IllegalStateException("not found")); expected="ana"; }
        }
        when(repository.retornarTotalChamadosMesPorExecutor(expected)).thenReturn(2);
        assertThat(service.retornarTotalChamadosMes()).containsEntry("total",2);
        service.retornarTotalChamadosAtrasados(); service.retornarTotalChamadosAtendidosPorMim();
        service.retornarTotalLucrosPorMes(); service.retornarQuantidadeAtendimentosPorTipo();
        verify(repository).retornarTotalChamadosAtrasadosPorExecutor(expected); verify(repository).retornarTotalChamadosFinalizadosPorExecutor(expected);
        verify(repository).retornarTotalChamadosPorMesPorExecutor(expected); verify(repository).retornarQuantidadeAtendimentoPorTipoPorExecutor(expected);
        verify(repository,never()).retornarTotalPorMes();
    }
    @Test void metricasPublicamValoresESemAlterarListas() {
        when(repository.retornarLucrosDoMes()).thenReturn(100.0); when(repository.retornarLucrosDoAno()).thenReturn(200.0);
        when(repository.retornarContratosAcabando()).thenReturn(3); when(repository.retornarTotalCancelados()).thenReturn(4); when(repository.retornarTotalProdutosEmFalta()).thenReturn(5);
        assertThat(service.retornarLucrosMes()).containsEntry("lucro",100.0); assertThat(service.retornarLucrosAno()).containsEntry("lucro",200.0);
        assertThat(service.retornarContratosEncerrando()).containsEntry("total",3); assertThat(service.retornarTotalChamadosCancelados()).containsEntry("total",4);
        assertThat(service.retornarProdutosEmFalta()).containsEntry("total",5);
        var sales=List.of(LucroDTO.builder().valor(100).build()); when(repository.retornarTotalVendasPorMes()).thenReturn(sales);
        assertThat(service.retornarTotalVendasPorMes()).isSameAs(sales);
        var contracts=List.of(ContratoCalendarioDTO.builder().idEmpresa(1).build()); when(repository.retornarContratosCalendario()).thenReturn(contracts);
        assertThat(service.retornarContratosCalendario()).isSameAs(contracts);
        var events=List.of(AgendaEventoDTO.builder().referenciaId(1).build()); when(repository.retornarAgendaEventos()).thenReturn(events);
        assertThat(service.retornarAgendaEventos()).isSameAs(events);
    }
}
