package br.com.sistema_gerencial.support;

import java.nio.charset.StandardCharsets;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.core.io.ClassPathResource;

/** Real SQL against an isolated H2 database using the production schema.
 * JSON is stored as text to match the JSON representation returned by MySQL JDBC.
 */
public abstract class DatabaseTestSupport {
    protected JdbcTemplate jdbc;
    protected NamedParameterJdbcTemplate namedJdbc;
    private java.sql.Connection databaseConnection;

    @BeforeEach
    void createDatabase() throws Exception {
        var ds = new DriverManagerDataSource("jdbc:h2:mem:" + UUID.randomUUID()
                + ";MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_ON_EXIT=FALSE", "sa", "");
        databaseConnection = ds.getConnection();
        jdbc = new JdbcTemplate(ds) {
            @Override public void execute(String sql) { super.execute(H2MySqlTestTemplate.translate(sql)); }
            @Override public int update(String sql) { return super.update(H2MySqlTestTemplate.translate(sql)); }
            @Override public int update(String sql, Object... args) { return super.update(H2MySqlTestTemplate.translate(sql), args); }
        };
        namedJdbc = new H2MySqlTestTemplate(ds);
        String schema = new ClassPathResource("init.sql").getContentAsString(StandardCharsets.UTF_8)
                .replaceAll("(?m)^CREATE DATABASE.*;", "")
                .replaceAll("(?m)^USE .*;", "")
                .replace("payload JSON", "payload TEXT");
        // Keep one connection open for the lifetime of the test database.
        for (String statement : schema.split(";")) {
            if (!statement.isBlank()) jdbc.execute(statement);
        }
        jdbc.execute("CREATE ALIAS DATE_FORMAT FOR 'br.com.sistema_gerencial.support.MySqlDateFunctions.dateFormat'");
    }

    @org.junit.jupiter.api.AfterEach
    void closeDatabase() throws Exception {
        if (databaseConnection != null) databaseConnection.close();
    }

    protected void seedOrigins() {
        jdbc.update("INSERT INTO clientes(id,nome_fantasia,nome,cpf,documento_normalizado) VALUES(1,'Cliente Teste','Ana','529.982.247-25','52998224725')");
        jdbc.update("INSERT INTO equipamentos(id,nome_maquina,setor,tipo_equipamento,id_empresa) VALUES(1,'PC','TI','COMPUTADOR',1)");
        jdbc.update("INSERT INTO atendimentos(id,id_empresa,descricao,data_inicio,data_fim,solicitante,executores) VALUES(1,1,'Atendimento',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'Ana','Tecnico')");
        jdbc.update("INSERT INTO manutencao(id,id_equipamento,descricao,data_inicio,data_fim,tipo_servico,executores) VALUES(1,1,'Manutencao',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'REPARO','Tecnico')");
        jdbc.update("INSERT INTO avulsos(id,nome_cliente,tipo_pessoa,cpf_cnpj,executores,descricao) VALUES(1,'Ana','f','52998224725','Tecnico','Avulso')");
    }
}
