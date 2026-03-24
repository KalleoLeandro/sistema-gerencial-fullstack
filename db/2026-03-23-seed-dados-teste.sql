USE sistema_gerencial_fullstack;

INSERT INTO empresas (
    nome_fantasia,
    razao_social,
    cnpj,
    ie,
    inscricao,
    infraestrutura,
    data_inicio,
    data_fim,
    endereco,
    numero,
    complemento,
    bairro,
    cidade,
    uf,
    cep,
    telefone,
    celular,
    email,
    contato
)
WITH RECURSIVE seq AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1 FROM seq WHERE n < 50
)
SELECT
    CONCAT('Empresa Teste ', LPAD(n, 2, '0')),
    CONCAT('Empresa Teste ', LPAD(n, 2, '0'), ' LTDA'),
    CONCAT(
        LPAD(((n * 17) MOD 90) + 10, 2, '0'),
        '.',
        LPAD(((n * 23) MOD 900) + 100, 3, '0'),
        '.',
        LPAD(((n * 31) MOD 900) + 100, 3, '0'),
        '/',
        LPAD(((n * 43) MOD 9000) + 1000, 4, '0'),
        '-',
        LPAD(((n * 7) MOD 90) + 10, 2, '0')
    ),
    CONCAT('IE', LPAD(100000 + n, 9, '0')),
    CONCAT('INS', LPAD(200000 + n, 6, '0')),
    CONCAT(
        'Infraestrutura de homologacao da empresa ',
        LPAD(n, 2, '0'),
        ': rede cabeada, wifi corporativo, backup semanal e parque com estacoes Windows e notebooks.'
    ),
    DATE_ADD('2026-01-01 08:00:00', INTERVAL n DAY),
    DATE_ADD('2027-01-01 18:00:00', INTERVAL n DAY),
    CONCAT('Avenida Frutiger Aero ', n),
    n,
    CONCAT('Sala ', ((n - 1) MOD 12) + 1),
    CONCAT('Bairro ', ((n - 1) MOD 10) + 1),
    CONCAT('Cidade ', ((n - 1) MOD 15) + 1),
    ELT(((n - 1) MOD 5) + 1, 'SP', 'RJ', 'MG', 'PR', 'SC'),
    CONCAT(LPAD(((n * 13) MOD 90000) + 10000, 5, '0'), '-', LPAD(((n * 29) MOD 900) + 100, 3, '0')),
    CONCAT('(11) 3', LPAD(1000000 + n, 7, '0')),
    CONCAT('(11) 9', LPAD(10000000 + n, 8, '0')),
    CONCAT('empresa', LPAD(n, 2, '0'), '@teste.local'),
    CONCAT('Contato ', LPAD(n, 2, '0'))
FROM seq
WHERE NOT EXISTS (
    SELECT 1
    FROM empresas e
    WHERE e.nome_fantasia = CONCAT('Empresa Teste ', LPAD(seq.n, 2, '0'))
);

INSERT INTO equipamentos (
    nome_maquina,
    setor,
    tipo_equipamento,
    placa_mae,
    marca,
    modelo,
    numero_serie,
    processador,
    memoria,
    hd_ssd,
    fonte,
    gabinete,
    id_empresa,
    observacoes
)
WITH RECURSIVE seq AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1 FROM seq WHERE n < 50
)
SELECT
    CONCAT('MAQ-', LPAD(n, 3, '0')),
    ELT(((n - 1) MOD 5) + 1, 'Financeiro', 'Comercial', 'Suporte', 'Operacoes', 'Diretoria'),
    ELT(((n - 1) MOD 4) + 1, 'Desktop', 'Notebook', 'Impressora', 'Servidor'),
    CONCAT('Placa Mae ', ((n - 1) MOD 8) + 1),
    ELT(((n - 1) MOD 5) + 1, 'Dell', 'Lenovo', 'HP', 'Asus', 'Acer'),
    CONCAT('Modelo ', LPAD(((n - 1) MOD 20) + 1, 2, '0')),
    CASE
        WHEN ELT(((n - 1) MOD 4) + 1, 'Desktop', 'Notebook', 'Impressora', 'Servidor') = 'Notebook'
            THEN CONCAT('SN-NB-', LPAD(n, 5, '0'))
        ELSE NULL
    END,
    ELT(((n - 1) MOD 5) + 1, 'Intel i5', 'Intel i7', 'Ryzen 5', 'Ryzen 7', 'Xeon E'),
    ELT(((n - 1) MOD 4) + 1, '8GB', '16GB', '32GB', '64GB'),
    ELT(((n - 1) MOD 4) + 1, '256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD'),
    ELT(((n - 1) MOD 3) + 1, '400W', '500W', '650W'),
    ELT(((n - 1) MOD 3) + 1, 'Mini Tower', 'Mid Tower', 'Rack 2U'),
    e.id,
    CONCAT('Equipamento de teste ', LPAD(n, 2, '0'), ' vinculado a ambiente de homologacao.')
FROM seq
JOIN empresas e
    ON e.nome_fantasia = CONCAT('Empresa Teste ', LPAD(seq.n, 2, '0'))
WHERE NOT EXISTS (
    SELECT 1
    FROM equipamentos eq
    WHERE eq.nome_maquina = CONCAT('MAQ-', LPAD(seq.n, 3, '0'))
);

INSERT INTO manutencao (
    id_equipamento,
    descricao,
    observacoes,
    data_inicio,
    data_fim,
    tipo_servico,
    valor_servico,
    valor_orcamento,
    executores,
    tipo_atendimento,
    status_atendimento,
    motivo_cancelamento,
    deslocamento,
    valor_deslocamento
)
WITH RECURSIVE seq AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1 FROM seq WHERE n < 50
)
SELECT
    eq.id,
    CONCAT('Manutencao preventiva executada no equipamento ', eq.nome_maquina, '.'),
    CONCAT('Checklist aplicado e pecas revisadas no ciclo ', LPAD(n, 2, '0'), '.'),
    DATE_ADD('2026-02-01 08:00:00', INTERVAL n DAY),
    DATE_ADD('2026-02-01 10:00:00', INTERVAL n DAY),
    ELT(((n - 1) MOD 4) + 1, 'Preventiva', 'Corretiva', 'Upgrade', 'Inspecao'),
    ROUND(120 + (n * 7.5), 2),
    ROUND(150 + (n * 8.3), 2),
    CONCAT('Tecnico ', ((n - 1) MOD 6) + 1, ', Auxiliar ', ((n - 1) MOD 4) + 1),
    ELT(((n - 1) MOD 3) + 1, 'Remoto', 'Presencial', 'Hibrido'),
    ((n - 1) MOD 3) + 1,
    CASE WHEN n MOD 10 = 0 THEN CONCAT('Reagendamento interno lote ', LPAD(n, 2, '0')) ELSE NULL END,
    (n MOD 30) + 1,
    ROUND(10 + (n * 1.8), 2)
FROM seq
JOIN equipamentos eq
    ON eq.nome_maquina = CONCAT('MAQ-', LPAD(seq.n, 3, '0'))
WHERE NOT EXISTS (
    SELECT 1
    FROM manutencao m
    WHERE m.id_equipamento = eq.id
      AND m.descricao = CONCAT('Manutencao preventiva executada no equipamento ', eq.nome_maquina, '.')
);

INSERT INTO atendimentos (
    id_empresa,
    descricao,
    observacoes,
    data_inicio,
    data_fim,
    solicitante,
    executores,
    valor_servico,
    valor_orcamento,
    tipo_atendimento,
    status_atendimento,
    motivo_cancelamento,
    deslocamento,
    valor_deslocamento
)
WITH RECURSIVE seq AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1 FROM seq WHERE n < 50
)
SELECT
    e.id,
    CONCAT('Atendimento operacional da empresa ', e.nome_fantasia, ' para rotina de suporte.'),
    CONCAT('Observacao do atendimento lote ', LPAD(n, 2, '0'), '.'),
    DATE_ADD('2026-03-01 09:00:00', INTERVAL n DAY),
    DATE_ADD('2026-03-01 11:00:00', INTERVAL n DAY),
    CONCAT('Solicitante ', LPAD(n, 2, '0')),
    CONCAT('Executor ', ((n - 1) MOD 5) + 1, ', Executor ', ((n MOD 5) + 1)),
    ROUND(180 + (n * 9.4), 2),
    ROUND(200 + (n * 10.1), 2),
    ELT(((n - 1) MOD 4) + 1, 'Suporte', 'Visita tecnica', 'Projeto', 'Treinamento'),
    ((n - 1) MOD 4) + 1,
    CASE WHEN n MOD 12 = 0 THEN CONCAT('Cancelamento de teste ', LPAD(n, 2, '0')) ELSE NULL END,
    (n MOD 25) + 2,
    ROUND(15 + (n * 2.1), 2)
FROM seq
JOIN empresas e
    ON e.nome_fantasia = CONCAT('Empresa Teste ', LPAD(seq.n, 2, '0'))
WHERE NOT EXISTS (
    SELECT 1
    FROM atendimentos a
    WHERE a.id_empresa = e.id
      AND a.descricao = CONCAT('Atendimento operacional da empresa ', e.nome_fantasia, ' para rotina de suporte.')
);

INSERT INTO avulsos (
    nome_cliente,
    razao_social,
    data_inicio,
    data_fim,
    tipo_pessoa,
    cpf_cnpj,
    ie,
    executores,
    descricao,
    observacoes,
    valor_servico,
    valor_orcamento,
    endereco,
    numero,
    complemento,
    bairro,
    cidade,
    uf,
    cep,
    telefone,
    celular,
    email,
    contato,
    tipo_atendimento,
    status_atendimento,
    motivo_cancelamento,
    deslocamento,
    valor_deslocamento,
    total
)
WITH RECURSIVE seq AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1 FROM seq WHERE n < 50
)
SELECT
    CONCAT('Cliente Avulso ', LPAD(n, 2, '0')),
    CASE
        WHEN n MOD 2 = 0 THEN CONCAT('Cliente Avulso ', LPAD(n, 2, '0'), ' LTDA')
        ELSE NULL
    END,
    DATE_ADD('2026-04-01 08:30:00', INTERVAL n DAY),
    DATE_ADD('2026-04-01 12:00:00', INTERVAL n DAY),
    CASE WHEN n MOD 2 = 0 THEN 'j' ELSE 'f' END,
    CASE
        WHEN n MOD 2 = 0 THEN CONCAT(
            LPAD(((n * 17) MOD 90) + 10, 2, '0'),
            '.',
            LPAD(((n * 23) MOD 900) + 100, 3, '0'),
            '.',
            LPAD(((n * 31) MOD 900) + 100, 3, '0'),
            '/',
            LPAD(((n * 43) MOD 9000) + 1000, 4, '0'),
            '-',
            LPAD(((n * 7) MOD 90) + 10, 2, '0')
        )
        ELSE CONCAT(
            LPAD(((n * 13) MOD 900) + 100, 3, '0'),
            '.',
            LPAD(((n * 19) MOD 900) + 100, 3, '0'),
            '.',
            LPAD(((n * 29) MOD 900) + 100, 3, '0'),
            '-',
            LPAD(((n * 11) MOD 90) + 10, 2, '0')
        )
    END,
    CASE WHEN n MOD 2 = 0 THEN CONCAT('IEA', LPAD(300000 + n, 6, '0')) ELSE NULL END,
    CONCAT('Executor ', ((n - 1) MOD 5) + 1),
    CONCAT('Atendimento avulso de teste ', LPAD(n, 2, '0'), ' com diagnostico inicial e entrega de relatorio.'),
    CONCAT('Observacao avulsa lote ', LPAD(n, 2, '0'), '.'),
    ROUND(90 + (n * 6.2), 2),
    ROUND(110 + (n * 6.9), 2),
    CONCAT('Rua Cliente ', n),
    n,
    CONCAT('Bloco ', ((n - 1) MOD 5) + 1),
    CONCAT('Bairro Avulso ', ((n - 1) MOD 9) + 1),
    CONCAT('Cidade Avulsa ', ((n - 1) MOD 11) + 1),
    ELT(((n - 1) MOD 5) + 1, 'SP', 'RJ', 'MG', 'PR', 'SC'),
    CONCAT(LPAD(((n * 37) MOD 90000) + 10000, 5, '0'), '-', LPAD(((n * 41) MOD 900) + 100, 3, '0')),
    CONCAT('(11) 4', LPAD(2000000 + n, 7, '0')),
    CONCAT('(11) 9', LPAD(20000000 + n, 8, '0')),
    CONCAT('cliente.avulso', LPAD(n, 2, '0'), '@teste.local'),
    CONCAT('Contato Avulso ', LPAD(n, 2, '0')),
    ELT(((n - 1) MOD 4) + 1, 'Suporte', 'Instalacao', 'Visita tecnica', 'Consultoria'),
    ((n - 1) MOD 4) + 1,
    CASE WHEN n MOD 14 = 0 THEN CONCAT('Motivo cancelamento avulso ', LPAD(n, 2, '0')) ELSE NULL END,
    (n MOD 40) + 1,
    ROUND(8 + (n * 1.7), 2),
    ROUND((90 + (n * 6.2)) + (8 + (n * 1.7)), 2)
FROM seq
WHERE NOT EXISTS (
    SELECT 1
    FROM avulsos a
    WHERE a.nome_cliente = CONCAT('Cliente Avulso ', LPAD(seq.n, 2, '0'))
);

INSERT INTO historico_alteracoes (
    tabela,
    nome_usuario,
    tipo_alteracao,
    data_alteracao,
    id_tabela
)
WITH RECURSIVE seq AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1 FROM seq WHERE n < 50
)
SELECT
    ELT(((n - 1) MOD 5) + 1, 'empresas', 'equipamentos', 'manutencao', 'atendimentos', 'avulsos'),
    CONCAT('usuario.teste.', LPAD(n, 2, '0')),
    ELT(((n - 1) MOD 3) + 1, 'CADASTRO', 'ATUALIZACAO', 'CONSULTA'),
    DATE_ADD('2026-05-01 08:00:00', INTERVAL n HOUR),
    n
FROM seq
WHERE NOT EXISTS (
    SELECT 1
    FROM historico_alteracoes h
    WHERE h.nome_usuario = CONCAT('usuario.teste.', LPAD(seq.n, 2, '0'))
      AND h.id_tabela = seq.n
);
