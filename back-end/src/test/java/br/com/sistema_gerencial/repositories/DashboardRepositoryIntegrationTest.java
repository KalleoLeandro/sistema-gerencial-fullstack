package br.com.sistema_gerencial.repositories;

import static org.assertj.core.api.Assertions.*;
import java.time.LocalDateTime;
import org.junit.jupiter.api.*;
import br.com.sistema_gerencial.models.dto.*;
import br.com.sistema_gerencial.support.DatabaseTestSupport;

class DashboardRepositoryIntegrationTest extends DatabaseTestSupport {
    DashboardRepository repository;
    @BeforeEach void setup() { repository=new DashboardRepository(namedJdbc); seedOrigins(); }
    @Test void calculaReceitaEAgregacoesMensais() {
        jdbc.update("UPDATE atendimentos SET valor_servico=100"); jdbc.update("UPDATE manutencao SET valor_servico=50");
        jdbc.update("UPDATE avulsos SET valor_servico=25,data_fim=CURRENT_TIMESTAMP");
        assertThat(repository.retornarLucrosDoMes()).isEqualTo(175);
        assertThat(repository.retornarLucrosDoAno()).isEqualTo(175);
        assertThat(repository.retornarTotalPorMes()).hasSize(1);
        assertThat(repository.retornarTotalPorMes().getFirst().getValor()).isEqualTo(175);
        assertThat(repository.retornarTotalVendasPorMes()).hasSize(12);
        assertThat(repository.retornarTotalVendasPorMes()).allSatisfy(item->assertThat(item.getValor()).isZero());
    }
    @Test void filtraChamadosPorExecutorEStatus() {
        String executors="[{\"id\":1,\"nome\":\"Tecnico\"}]";
        jdbc.update("UPDATE atendimentos SET executores=?,data_inicio=CURRENT_TIMESTAMP,data_fim=?",executors,LocalDateTime.now().minusDays(1));
        jdbc.update("UPDATE manutencao SET executores=?,data_inicio=CURRENT_TIMESTAMP,status_atendimento=3",executors);
        jdbc.update("UPDATE avulsos SET executores=?,data_inicio=CURRENT_TIMESTAMP,status_atendimento=4",executors);
        assertThat(repository.retornarTotalChamadosMesPorExecutor("Tecnico")).isEqualTo(3);
        assertThat(repository.retornarTotalChamadosMesPorExecutor("Outro")).isZero();
        assertThat(repository.retornarTotalChamadosAtrasadosPorExecutor("Tecnico")).isEqualTo(1);
        assertThat(repository.retornarTotalChamadosFinalizadosPorExecutor("Tecnico")).isEqualTo(1);
        assertThat(repository.retornarTotalCancelados()).isEqualTo(1);
        assertThat(repository.retornarTotalChamadosPorMesPorExecutor("Tecnico").getFirst().getValor()).isEqualTo(3);
    }
    @Test void estoqueETiposDeAtendimento() {
        jdbc.update("INSERT INTO produtos(nome,estoque_atual,estoque_minimo,ativo) VALUES('Falta',1,3,TRUE),('Inativo',0,3,FALSE),('Normal',3,3,TRUE)");
        assertThat(repository.retornarTotalProdutosEmFalta()).isEqualTo(1);
        jdbc.update("UPDATE atendimentos SET tipo_atendimento='REMOTO',executores='[{\"id\":1,\"nome\":\"Tecnico\"}]'");
        jdbc.update("UPDATE manutencao SET tipo_atendimento='PRESENCIAL'");
        jdbc.update("UPDATE avulsos SET tipo_atendimento='IGNORADO'");
        assertThat(repository.retornarQuantidadeAtendimentoPorTipo()).hasSize(2);
        assertThat(repository.retornarQuantidadeAtendimentoPorTipoPorExecutor("Tecnico")).extracting(TipoAtendimentoDTO::getTipo).containsExactly("REMOTO");
    }
    @Test void calendarioIncluiContratosEAgendaOrdenados() {
        var future=LocalDateTime.now().plusDays(15);
        jdbc.update("UPDATE clientes SET data_fim=?",future); jdbc.update("UPDATE avulsos SET data_inicio=CURRENT_TIMESTAMP");
        jdbc.update("INSERT INTO agendamentos(titulo,tipo_tarefa,data_agendamento) VALUES('Visita','SUPORTE',CURRENT_TIMESTAMP)");
        assertThat(repository.retornarContratosAcabando()).isEqualTo(1);
        assertThat(repository.retornarContratosCalendario()).extracting(ContratoCalendarioDTO::getNomeFantasia).containsExactly("Cliente Teste");
        assertThat(repository.retornarAgendaEventos()).extracting(AgendaEventoDTO::getTipo)
                .containsExactlyInAnyOrder("FINALIZACAO_CONTRATO","ORDEM_SERVICO","AGENDAMENTO","ATENDIMENTO","MANUTENCAO");
        assertThat(repository.retornarAgendaEventos()).extracting(AgendaEventoDTO::getDataEvento).isSorted();
    }
}
