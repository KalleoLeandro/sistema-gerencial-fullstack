package br.com.sistema_gerencial.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configura exchange, fila, roteamento e conversão JSON dos eventos comerciais no RabbitMQ.
 */
@Configuration
public class MensageriaConfig {

	@Bean
	public DirectExchange fluxoComercialExchange(@Value("${app.comercial.exchange}") String exchange) {
		return new DirectExchange(exchange, true, false);
	}

	@Bean
	public Queue fluxoComercialQueue(@Value("${app.comercial.queue}") String queue) {
		return new Queue(queue, true);
	}

	@Bean
	public Binding fluxoComercialBinding(Queue fluxoComercialQueue, DirectExchange fluxoComercialExchange,
			@Value("${app.comercial.routing-key}") String routingKey) {
		return BindingBuilder.bind(fluxoComercialQueue).to(fluxoComercialExchange).with(routingKey);
	}

	@Bean
	public Jackson2JsonMessageConverter jackson2JsonMessageConverter() {
		return new Jackson2JsonMessageConverter();
	}
}
