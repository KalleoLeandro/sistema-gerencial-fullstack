package br.com.sistema_gerencial.support;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

/** One business date shared by Java fixtures and SQL test queries. Never the host clock. */
public final class TestTime {
    private TestTime() {}
    public static final ZoneId ZONE = ZoneId.of("America/Sao_Paulo");
    public static final LocalDate TODAY = LocalDate.of(2026, 10, 13);
    public static final LocalDateTime NOW = TODAY.atTime(12, 0);
    public static final Clock CLOCK = Clock.fixed(NOW.atZone(ZONE).toInstant(), ZONE);
    public static final String SQL_DATE = "DATE '" + TODAY + "'";
    public static final String SQL_TIMESTAMP = "TIMESTAMP '" + NOW.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) + "'";
}
