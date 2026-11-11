package br.com.sistema_gerencial.services.impl;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Base64;

import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import br.com.sistema_gerencial.models.dto.OutboxEventoDTO;
import lombok.RequiredArgsConstructor;

/**
 * Persiste histórico, notificações, resumos de eventos e documentos gerados no MongoDB.
 */
@Service
@RequiredArgsConstructor
public class MongoAuditoriaService {

	private final MongoTemplate mongoTemplate;

	public void processar(OutboxEventoDTO evento) {
		LocalDateTime agora = LocalDateTime.now();

		Document historico = new Document()
				.append("aggregateType", evento.getAggregateType())
				.append("aggregateId", evento.getAggregateId())
				.append("eventType", evento.getEventType())
				.append("payload", Document.parse(evento.getPayload().toString()))
				.append("tentativas", evento.getTentativas())
				.append("criadoEm", evento.getCriadoEm())
				.append("processadoEm", agora);
		mongoTemplate.getCollection("historico_eventos").insertOne(historico);

		Document notificacao = new Document()
				.append("aggregateType", evento.getAggregateType())
				.append("aggregateId", evento.getAggregateId())
				.append("eventType", evento.getEventType())
				.append("titulo", "Evento " + evento.getEventType())
				.append("mensagem", "Evento " + evento.getEventType() + " processado para " + evento.getAggregateType()
						+ " #" + evento.getAggregateId())
				.append("status", "GERADA")
				.append("criadoEm", agora);
		mongoTemplate.getCollection("notificacoes").insertOne(notificacao);

		Document filtroDashboard = new Document("_id", evento.getEventType());
		Document atualizacaoDashboard = new Document("$inc", new Document("quantidade", 1))
				.append("$set", new Document("aggregateType", evento.getAggregateType())
						.append("ultimaAtualizacao", agora)
						.append("ultimoAggregateId", evento.getAggregateId()));
		mongoTemplate.getCollection("dashboard_resumo").updateOne(filtroDashboard, atualizacaoDashboard,
				new com.mongodb.client.model.UpdateOptions().upsert(true));

		if (deveGerarDocumento(evento.getEventType())) {
			mongoTemplate.getCollection("documentos_gerados").insertOne(new Document()
					.append("referenciaId", evento.getAggregateId())
					.append("tipo", evento.getEventType())
					.append("nomeArquivo", evento.getEventType().toLowerCase() + "-" + evento.getAggregateId() + ".pdf")
					.append("conteudoBase64", Base64.getEncoder().encodeToString(gerarPdfMinimo(evento).getBytes(StandardCharsets.UTF_8)))
					.append("criadoEm", agora));
		}
	}

	private boolean deveGerarDocumento(String eventType) {
		return "ORCAMENTO_GERADO".equals(eventType)
				|| "ORCAMENTO_APROVADO".equals(eventType)
				|| "VENDA_GERADA".equals(eventType)
				|| "PAGAMENTO_REGISTRADO".equals(eventType);
	}

	private String gerarPdfMinimo(OutboxEventoDTO evento) {
		String texto = String.format("Evento: %s | Aggregate: %s #%d", evento.getEventType(), evento.getAggregateType(),
				evento.getAggregateId()).replace("(", "\\(").replace(")", "\\)");
		String stream = "BT /F1 12 Tf 50 750 Td (" + texto + ") Tj ET";
		int length = stream.getBytes(StandardCharsets.UTF_8).length;
		return "%PDF-1.4\n"
				+ "1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
				+ "2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n"
				+ "3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n"
				+ "4 0 obj<</Length " + length + ">>stream\n"
				+ stream + "\nendstream\nendobj\n"
				+ "5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\n"
				+ "xref\n0 6\n0000000000 65535 f \n"
				+ "trailer<</Root 1 0 R/Size 6>>\nstartxref\n0\n%%EOF";
	}
}
