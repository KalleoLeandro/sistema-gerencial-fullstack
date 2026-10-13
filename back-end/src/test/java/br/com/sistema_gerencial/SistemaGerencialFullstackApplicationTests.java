package br.com.sistema_gerencial;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
    "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration,org.springframework.boot.autoconfigure.data.mongo.MongoDataAutoConfiguration,org.springframework.boot.autoconfigure.data.mongo.MongoRepositoriesAutoConfiguration",
    "spring.rabbitmq.listener.simple.auto-startup=false",
    "spring.rabbitmq.listener.direct.auto-startup=false"
})
@org.springframework.test.context.ActiveProfiles("test")
class SistemaGerencialFullstackApplicationTests {

    @org.springframework.test.context.bean.override.mockito.MockitoBean
    org.springframework.data.mongodb.core.MongoTemplate mongoTemplate;

    @org.springframework.test.context.bean.override.mockito.MockitoBean
    br.com.sistema_gerencial.services.impl.OutboxPublisherService outboxPublisher;

	@Test
	void contextLoads() {
	}

}
