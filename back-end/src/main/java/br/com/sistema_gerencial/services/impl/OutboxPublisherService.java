package br.com.sistema_gerencial.services.impl;

import java.util.List;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import br.com.sistema_gerencial.models.dto.OutboxEventoDTO;
import br.com.sistema_gerencial.repositories.FluxoComercialRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Publica eventos pendentes da outbox no RabbitMQ e registra o resultado de cada tentativa.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OutboxPublisherService {

	private final FluxoComercialRepository repository;
	private final RabbitTemplate rabbitTemplate;

	@Value("${app.comercial.exchange}")
	private String exchange;

	@Value("${app.comercial.routing-key}")
	private String routingKey;

	@Value("${app.comercial.outbox-batch-size}")
	private int batchSize;

	@Scheduled(fixedDelay = 5000)
	public void publicarPendencias() {
		List<OutboxEventoDTO> eventos = repository.listarEventosPendentes(batchSize);
		for (OutboxEventoDTO evento : eventos) {
			try {
				rabbitTemplate.convertAndSend(exchange, routingKey, evento);
				repository.marcarEventoProcessado(evento.getId());
			} catch (Exception exception) {
				log.error("Falha ao publicar evento {} da outbox.", evento.getId(), exception);
				repository.registrarFalhaEvento(evento.getId(), exception.getMessage());
			}
		}
	}
}
