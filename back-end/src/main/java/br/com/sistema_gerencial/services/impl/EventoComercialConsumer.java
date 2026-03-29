package br.com.sistema_gerencial.services.impl;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import br.com.sistema_gerencial.models.dto.OutboxEventoDTO;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EventoComercialConsumer {

	private final MongoAuditoriaService mongoAuditoriaService;

	@RabbitListener(queues = "${app.comercial.queue}")
	public void consumir(OutboxEventoDTO evento) {
		mongoAuditoriaService.processar(evento);
	}
}
