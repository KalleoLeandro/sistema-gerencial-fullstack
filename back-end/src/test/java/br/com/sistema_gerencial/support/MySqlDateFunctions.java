package br.com.sistema_gerencial.support;

import java.sql.Timestamp;
import java.time.format.DateTimeFormatter;

/** The small subset of DATE_FORMAT used by the repository queries. */
public final class MySqlDateFunctions {
    private MySqlDateFunctions() {}
    public static String dateFormat(Timestamp timestamp,String format) {
        if(timestamp==null) return null;
        return timestamp.toLocalDateTime().format(DateTimeFormatter.ofPattern(
                format.replace("%Y","yyyy").replace("%m","MM").replace("%d","dd")));
    }
}
