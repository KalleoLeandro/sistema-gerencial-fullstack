package br.com.sistema_gerencial;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableRabbit
public class SistemaGerencialFullstackApplication {

	public static void main(String[] args) {
		SpringApplication.run(SistemaGerencialFullstackApplication.class, args);
	}

}
