package br.com.sistema_gerencial.services.impl;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import org.bson.Document;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.test.util.ReflectionTestUtils;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.UpdateOptions;
import com.fasterxml.jackson.databind.ObjectMapper;
import br.com.sistema_gerencial.models.dto.OutboxEventoDTO;
import br.com.sistema_gerencial.repositories.FluxoComercialRepository;

class MensageriaTest {
    @Test void publicadorRegistraFalhaEContinuaComProximoEvento() {
        var repository=mock(FluxoComercialRepository.class); var rabbit=mock(RabbitTemplate.class);
        var first=OutboxEventoDTO.builder().id(1).build(); var second=OutboxEventoDTO.builder().id(2).build();
        when(repository.listarEventosPendentes(10)).thenReturn(List.of(first,second));
        doThrow(new IllegalStateException("offline")).when(rabbit).convertAndSend("exchange","routing",first);
        var service=new OutboxPublisherService(repository,rabbit);
        ReflectionTestUtils.setField(service,"exchange","exchange"); ReflectionTestUtils.setField(service,"routingKey","routing");
        ReflectionTestUtils.setField(service,"batchSize",10); service.publicarPendencias();
        verify(repository).registrarFalhaEvento(1,"offline"); verify(repository,never()).marcarEventoProcessado(1);
        var order=inOrder(rabbit,repository); order.verify(rabbit).convertAndSend("exchange","routing",second); order.verify(repository).marcarEventoProcessado(2);
    }
    @Test void publicadorVazioNaoEnviaNada() {
        var repository=mock(FluxoComercialRepository.class); var rabbit=mock(RabbitTemplate.class);
        when(repository.listarEventosPendentes(anyInt())).thenReturn(List.of()); new OutboxPublisherService(repository,rabbit).publicarPendencias();
        verifyNoInteractions(rabbit);
    }
    @ParameterizedTest @ValueSource(strings={"ORCAMENTO_GERADO","ORCAMENTO_APROVADO","VENDA_GERADA","PAGAMENTO_REGISTRADO","ORCAMENTO_REJEITADO"})
    void consumidorRegistraAuditoriaNotificacaoDashboardEDocumento(String type) throws Exception {
        var mongo=mock(MongoTemplate.class); MongoCollection<Document> history=mock(MongoCollection.class);
        MongoCollection<Document> notifications=mock(MongoCollection.class); MongoCollection<Document> dashboard=mock(MongoCollection.class);
        MongoCollection<Document> files=mock(MongoCollection.class);
        when(mongo.getCollection("historico_eventos")).thenReturn(history); when(mongo.getCollection("notificacoes")).thenReturn(notifications);
        when(mongo.getCollection("dashboard_resumo")).thenReturn(dashboard);
        if(!type.equals("ORCAMENTO_REJEITADO")) when(mongo.getCollection("documentos_gerados")).thenReturn(files);
        var event=OutboxEventoDTO.builder().aggregateType("ORCAMENTO").aggregateId(7).eventType(type)
                .payload(new ObjectMapper().readTree("{\"total\":100}")).tentativas(2).build();
        new EventoComercialConsumer(new MongoAuditoriaService(mongo)).consumir(event);
        var historyCaptor=org.mockito.ArgumentCaptor.forClass(Document.class); verify(history).insertOne(historyCaptor.capture());
        assertThat(historyCaptor.getValue()).containsEntry("aggregateId",7L).containsEntry("eventType",type).containsEntry("tentativas",2);
        assertThat(historyCaptor.getValue().get("payload",Document.class)).containsEntry("total",100);
        verify(notifications).insertOne(argThat(doc->"GERADA".equals(doc.getString("status"))));
        verify(dashboard).updateOne(eq(new Document("_id",type)),argThat((Document doc)->doc.toString().contains("$inc")),argThat(options->options.isUpsert()));
        if(type.equals("ORCAMENTO_REJEITADO")) verifyNoInteractions(files);
        else {
            var fileCaptor=org.mockito.ArgumentCaptor.forClass(Document.class); verify(files).insertOne(fileCaptor.capture());
            assertThat(fileCaptor.getValue().getString("nomeArquivo")).isEqualTo(type.toLowerCase()+"-7.pdf");
            String pdf=new String(Base64.getDecoder().decode(fileCaptor.getValue().getString("conteudoBase64")),StandardCharsets.UTF_8);
            assertThat(pdf).startsWith("%PDF-1.4").contains(type,"ORCAMENTO #7").endsWith("%%EOF");
        }
    }
    @Test void erroNaAuditoriaPropagaParaPermitirRetry() {
        var audit=mock(MongoAuditoriaService.class); var event=OutboxEventoDTO.builder().id(1).build();
        doThrow(new IllegalStateException("mongo offline")).when(audit).processar(event);
        assertThatThrownBy(()->new EventoComercialConsumer(audit).consumir(event)).hasMessage("mongo offline");
    }
}
