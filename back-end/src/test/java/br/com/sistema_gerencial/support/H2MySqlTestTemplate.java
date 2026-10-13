package br.com.sistema_gerencial.support;

import javax.sql.DataSource;
import org.springframework.jdbc.core.PreparedStatementCreator;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterUtils;
import org.springframework.jdbc.core.RowMapper;
import java.util.List;

/** Explicit dialect translations for H2, never used by the application. */
final class H2MySqlTestTemplate extends NamedParameterJdbcTemplate {
    H2MySqlTestTemplate(DataSource source) { super(source); }
    static String translate(String sql) {
        return sql.replace("CAST(:payload AS JSON)", ":payload")
                .replace("CAST(payload AS CHAR)", "CAST(payload AS VARCHAR)")
                .replaceAll("DATE_ADD\\(NOW\\(\\), INTERVAL (\\d+) (MINUTE|MONTH|YEAR|DAY)\\)", "DATEADD('$2', $1, NOW())")
                .replaceAll("(?s)DELETE p\\s+FROM pagamentos p\\s+INNER JOIN parcelas pa ON pa.id = p.id_parcela\\s+WHERE pa.id_venda = :idVenda",
                        "DELETE FROM pagamentos WHERE id_parcela IN (SELECT id FROM parcelas WHERE id_venda = :idVenda)");
    }
    @Override protected PreparedStatementCreator getPreparedStatementCreator(String sql, SqlParameterSource params) {
        return super.getPreparedStatementCreator(translate(sql), params);
    }
    @Override public <T> List<T> query(String sql, RowMapper<T> mapper) {
        return super.query(translate(sql), mapper);
    }
}
