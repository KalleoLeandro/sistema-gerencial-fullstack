package br.com.sistema_gerencial.config;

import java.time.Clock;
import java.time.ZoneId;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Disponibiliza o relógio de negócio no fuso configurado por {@code app.time-zone}.
 */
@Configuration
public class ClockConfig {
    @Bean
    public Clock businessClock(@Value("${app.time-zone:America/Sao_Paulo}") String timeZone) {
        return Clock.system(ZoneId.of(timeZone));
    }
}
