USE sistema_gerencial_fullstack;

INSERT INTO agendamentos (
    titulo,
    tipo_tarefa,
    data_agendamento,
    detalhes,
    concluido
)
WITH RECURSIVE seq AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1 FROM seq WHERE n < 20
)
SELECT
    CONCAT('Agendamento de Teste ', LPAD(n, 2, '0')),
    ELT(((n - 1) MOD 6) + 1, 'Visita tecnica', 'Compra de material', 'Entrega', 'Reuniao', 'Instalacao', 'Retorno ao cliente'),
    DATE_ADD('2026-04-15 09:00:00', INTERVAL n DAY),
    CONCAT('Detalhes do agendamento de teste ', LPAD(n, 2, '0'), ': alinhamento operacional, checklist previo e confirmacao com o cliente.'),
    CASE WHEN n MOD 5 = 0 THEN TRUE ELSE FALSE END
FROM seq
WHERE NOT EXISTS (
    SELECT 1
    FROM agendamentos a
    WHERE a.titulo = CONCAT('Agendamento de Teste ', LPAD(seq.n, 2, '0'))
);
