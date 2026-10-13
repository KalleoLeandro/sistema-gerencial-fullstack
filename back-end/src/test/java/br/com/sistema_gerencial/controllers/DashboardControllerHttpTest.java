package br.com.sistema_gerencial.controllers;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.junit.jupiter.api.*;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.test.web.servlet.MockMvc;
import java.util.*;
import br.com.sistema_gerencial.services.DashboardService;
class DashboardControllerHttpTest {
    DashboardService service; MockMvc mvc;
    @BeforeEach void setup() { service=mock(DashboardService.class); mvc=MockMvcBuilders.standaloneSetup(new DashboardController(service)).build(); }
    @Test void metric0() throws Exception {
        when(service.retornarLucrosMes()).thenReturn(Map.of("lucro",100));
        mvc.perform(get("/dashboard/retornar-lucro-mes")).andExpect(status().isOk()).andExpect(jsonPath("$.lucro").value(100));
        verify(service).retornarLucrosMes();
    }
    @Test void metric1() throws Exception {
        when(service.retornarLucrosAno()).thenReturn(Map.of("lucro",200));
        mvc.perform(get("/dashboard/retornar-lucro-ano")).andExpect(status().isOk()).andExpect(jsonPath("$.lucro").value(200));
        verify(service).retornarLucrosAno();
    }
    @Test void metric2() throws Exception {
        when(service.retornarContratosEncerrando()).thenReturn(Map.of("total",3));
        mvc.perform(get("/dashboard/retornar-contratos-acabando")).andExpect(status().isOk()).andExpect(jsonPath("$.total").value(3));
        verify(service).retornarContratosEncerrando();
    }
    @Test void metric3() throws Exception {
        when(service.retornarTotalChamadosCancelados()).thenReturn(Map.of("total",4));
        mvc.perform(get("/dashboard/retornar-chamados-cancelados")).andExpect(status().isOk()).andExpect(jsonPath("$.total").value(4));
        verify(service).retornarTotalChamadosCancelados();
    }
    @Test void metric4() throws Exception {
        when(service.retornarTotalChamadosMes()).thenReturn(Map.of("total",5));
        mvc.perform(get("/dashboard/retornar-total-chamados-mes")).andExpect(status().isOk()).andExpect(jsonPath("$.total").value(5));
        verify(service).retornarTotalChamadosMes();
    }
    @Test void metric5() throws Exception {
        when(service.retornarTotalChamadosAtrasados()).thenReturn(Map.of("total",6));
        mvc.perform(get("/dashboard/retornar-chamados-atrasados")).andExpect(status().isOk()).andExpect(jsonPath("$.total").value(6));
        verify(service).retornarTotalChamadosAtrasados();
    }
    @Test void metric6() throws Exception {
        when(service.retornarTotalChamadosAtendidosPorMim()).thenReturn(Map.of("total",7));
        mvc.perform(get("/dashboard/retornar-chamados-atendidos-por-mim")).andExpect(status().isOk()).andExpect(jsonPath("$.total").value(7));
        verify(service).retornarTotalChamadosAtendidosPorMim();
    }
    @Test void metric7() throws Exception {
        when(service.retornarProdutosEmFalta()).thenReturn(Map.of("total",8));
        mvc.perform(get("/dashboard/retornar-produtos-em-falta")).andExpect(status().isOk()).andExpect(jsonPath("$.total").value(8));
        verify(service).retornarProdutosEmFalta();
    }
    @Test void metric8() throws Exception {
        when(service.retornarTotalLucrosPorMes()).thenReturn(List.of());
        mvc.perform(get("/dashboard/retornar-por-mes")).andExpect(status().isOk()).andExpect(content().json("[]"));
        verify(service).retornarTotalLucrosPorMes();
    }
    @Test void metric9() throws Exception {
        when(service.retornarTotalVendasPorMes()).thenReturn(List.of());
        mvc.perform(get("/dashboard/retornar-vendas-por-mes")).andExpect(status().isOk()).andExpect(content().json("[]"));
        verify(service).retornarTotalVendasPorMes();
    }
    @Test void metric10() throws Exception {
        when(service.retornarQuantidadeAtendimentosPorTipo()).thenReturn(List.of());
        mvc.perform(get("/dashboard/retornar-proporcao-atendimento")).andExpect(status().isOk()).andExpect(content().json("[]"));
        verify(service).retornarQuantidadeAtendimentosPorTipo();
    }
    @Test void metric11() throws Exception {
        when(service.retornarContratosCalendario()).thenReturn(List.of());
        mvc.perform(get("/dashboard/retornar-contratos-calendario")).andExpect(status().isOk()).andExpect(content().json("[]"));
        verify(service).retornarContratosCalendario();
    }
    @Test void metric12() throws Exception {
        when(service.retornarAgendaEventos()).thenReturn(List.of());
        mvc.perform(get("/dashboard/retornar-agenda-eventos")).andExpect(status().isOk()).andExpect(content().json("[]"));
        verify(service).retornarAgendaEventos();
    }
}

