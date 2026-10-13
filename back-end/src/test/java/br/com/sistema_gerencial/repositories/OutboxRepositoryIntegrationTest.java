package br.com.sistema_gerencial.repositories;

import static org.assertj.core.api.Assertions.*;
import java.util.Map;
import org.junit.jupiter.api.Test;
import com.fasterxml.jackson.databind.ObjectMapper;
import br.com.sistema_gerencial.support.DatabaseTestSupport;

class OutboxRepositoryIntegrationTest extends DatabaseTestSupport {
    @Test void pendentesRespeitamLoteOrdemDisponibilidadeEProcessamento() {
        var repository=new FluxoComercialRepository(namedJdbc,new ObjectMapper());
        repository.registrarEventoOutbox("VENDA",1,"VENDA_GERADA",Map.of("total",100));
        repository.registrarEventoOutbox("VENDA",2,"VENDA_GERADA",Map.of("total",200));
        var first=repository.listarEventosPendentes(0).getFirst();
        assertThat(first.getPayload().get("total").asInt()).isEqualTo(100);
        assertThat(repository.listarEventosPendentes(0)).hasSize(1);
        repository.registrarFalhaEvento(first.getId(),"offline");
        assertThat(repository.listarEventosPendentes(100)).hasSize(1);
        assertThat(jdbc.queryForObject("SELECT tentativas FROM outbox_eventos WHERE id=?",Integer.class,first.getId())).isEqualTo(1);
        jdbc.update("UPDATE outbox_eventos SET disponivel_em=CURRENT_TIMESTAMP WHERE id=?",first.getId());
        assertThat(repository.listarEventosPendentes(100)).hasSize(2);
        repository.marcarEventoProcessado(first.getId()); assertThat(repository.listarEventosPendentes(100)).hasSize(1);
        assertThat(jdbc.queryForObject("SELECT erro FROM outbox_eventos WHERE id=?",String.class,first.getId())).isNull();
        assertThat(jdbc.queryForObject("SELECT tentativas FROM outbox_eventos WHERE id=?",Integer.class,first.getId())).isEqualTo(2);
    }
    @Test void jsonInvalidoRetornaErroControlado() {
        jdbc.update("INSERT INTO outbox_eventos(aggregate_type,aggregate_id,event_type,payload) VALUES('VENDA',1,'VENDA_GERADA','broken')");
        assertThatThrownBy(()->new FluxoComercialRepository(namedJdbc,new ObjectMapper()).listarEventosPendentes(10)).hasMessageContaining("eventos pendentes");
    }
}
