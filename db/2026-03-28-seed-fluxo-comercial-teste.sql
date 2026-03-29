USE sistema_gerencial_fullstack;

INSERT INTO produtos (
    codigo,
    nome,
    descricao,
    unidade_medida,
    valor_custo,
    valor_venda,
    estoque_atual,
    estoque_minimo,
    ativo
)
WITH RECURSIVE seq AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1 FROM seq WHERE n < 20
)
SELECT
    CONCAT('PRD-', LPAD(n, 4, '0')),
    CONCAT('Produto Comercial Teste ', LPAD(n, 2, '0')),
    CONCAT('Produto de homologacao para orcamentos e vendas lote ', LPAD(n, 2, '0'), '.'),
    ELT(((n - 1) MOD 4) + 1, 'UN', 'CX', 'HR', 'KIT'),
    ROUND(35 + (n * 4.75), 2),
    ROUND(65 + (n * 7.9), 2),
    ROUND(8 + (n * 1.5), 3),
    ROUND(2 + (n * 0.4), 3),
    TRUE
FROM seq
WHERE NOT EXISTS (
    SELECT 1
    FROM produtos p
    WHERE p.codigo = CONCAT('PRD-', LPAD(seq.n, 4, '0'))
);

INSERT INTO servicos (
    codigo,
    nome,
    descricao,
    valor_padrao,
    ativo
)
WITH RECURSIVE seq AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1 FROM seq WHERE n < 12
)
SELECT
    CONCAT('SRV-', LPAD(n, 4, '0')),
    CONCAT('Servico Comercial Teste ', LPAD(n, 2, '0')),
    CONCAT('Servico de homologacao para fluxo comercial lote ', LPAD(n, 2, '0'), '.'),
    ROUND(90 + (n * 12.5), 2),
    TRUE
FROM seq
WHERE NOT EXISTS (
    SELECT 1
    FROM servicos s
    WHERE s.codigo = CONCAT('SRV-', LPAD(seq.n, 4, '0'))
);

INSERT INTO orcamentos (
    codigo,
    origem_tipo,
    id_atendimento,
    id_manutencao,
    id_avulso,
    cliente_nome,
    cliente_documento,
    status,
    validade_em,
    aprovado_em,
    desconto_financeiro,
    acrescimo_financeiro,
    subtotal,
    total_desconto,
    total_acrescimo,
    total_geral,
    observacoes
)
SELECT
    CONCAT('ORC-ATD-', LPAD(a.id, 4, '0')),
    'ATENDIMENTO',
    a.id,
    NULL,
    NULL,
    e.nome_fantasia,
    e.cnpj,
    'EM_ANALISE',
    DATE('2026-04-30'),
    NULL,
    35.00,
    0.00,
    680.00,
    35.00,
    0.00,
    645.00,
    CONCAT('Orcamento de teste vinculado ao atendimento ', a.id, '.')
FROM atendimentos a
JOIN empresas e ON e.id = a.id_empresa
WHERE a.id BETWEEN 1 AND 3
  AND NOT EXISTS (
      SELECT 1
      FROM orcamentos o
      WHERE o.id_atendimento = a.id
  );

INSERT INTO orcamentos (
    codigo,
    origem_tipo,
    id_atendimento,
    id_manutencao,
    id_avulso,
    cliente_nome,
    cliente_documento,
    status,
    validade_em,
    aprovado_em,
    desconto_financeiro,
    acrescimo_financeiro,
    subtotal,
    total_desconto,
    total_acrescimo,
    total_geral,
    observacoes
)
SELECT
    CONCAT('ORC-MNT-', LPAD(m.id, 4, '0')),
    'MANUTENCAO',
    NULL,
    m.id,
    NULL,
    e.nome_fantasia,
    e.cnpj,
    'APROVADO',
    DATE('2026-05-05'),
    DATE_ADD('2026-04-20 10:00:00', INTERVAL m.id DAY),
    50.00,
    15.00,
    990.00,
    50.00,
    15.00,
    955.00,
    CONCAT('Orcamento aprovado de teste vinculado a manutencao ', m.id, '.')
FROM manutencao m
JOIN equipamentos eq ON eq.id = m.id_equipamento
JOIN empresas e ON e.id = eq.id_empresa
WHERE m.id BETWEEN 1 AND 2
  AND NOT EXISTS (
      SELECT 1
      FROM orcamentos o
      WHERE o.id_manutencao = m.id
  );

INSERT INTO orcamentos (
    codigo,
    origem_tipo,
    id_atendimento,
    id_manutencao,
    id_avulso,
    cliente_nome,
    cliente_documento,
    status,
    validade_em,
    aprovado_em,
    desconto_financeiro,
    acrescimo_financeiro,
    subtotal,
    total_desconto,
    total_acrescimo,
    total_geral,
    observacoes
)
SELECT
    CONCAT('ORC-AVL-', LPAD(av.id, 4, '0')),
    'AVULSO',
    NULL,
    NULL,
    av.id,
    av.nome_cliente,
    av.cpf_cnpj,
    'EM_ANALISE',
    DATE('2026-05-10'),
    NULL,
    20.00,
    0.00,
    540.00,
    20.00,
    0.00,
    520.00,
    CONCAT('Orcamento de teste vinculado ao avulso ', av.id, '.')
FROM avulsos av
WHERE av.id BETWEEN 1 AND 3
  AND NOT EXISTS (
      SELECT 1
      FROM orcamentos o
      WHERE o.id_avulso = av.id
  );

INSERT INTO orcamento_itens (
    id_orcamento,
    tipo_item,
    id_produto,
    id_servico,
    descricao,
    quantidade,
    valor_unitario,
    percentual_desconto,
    valor_desconto,
    valor_total,
    ordem
)
SELECT
    o.id,
    'PRODUTO',
    p.id,
    NULL,
    p.nome,
    2.000,
    p.valor_venda,
    0.00,
    0.00,
    ROUND(2 * p.valor_venda, 2),
    1
FROM orcamentos o
JOIN produtos p ON p.codigo = 'PRD-0001'
WHERE o.codigo IN ('ORC-ATD-0001', 'ORC-MNT-0001', 'ORC-AVL-0001')
  AND NOT EXISTS (
      SELECT 1
      FROM orcamento_itens oi
      WHERE oi.id_orcamento = o.id
        AND oi.ordem = 1
  );

INSERT INTO orcamento_itens (
    id_orcamento,
    tipo_item,
    id_produto,
    id_servico,
    descricao,
    quantidade,
    valor_unitario,
    percentual_desconto,
    valor_desconto,
    valor_total,
    ordem
)
SELECT
    o.id,
    'SERVICO',
    NULL,
    s.id,
    s.nome,
    1.000,
    s.valor_padrao,
    5.00,
    ROUND(s.valor_padrao * 0.05, 2),
    ROUND(s.valor_padrao * 0.95, 2),
    2
FROM orcamentos o
JOIN servicos s ON s.codigo = 'SRV-0001'
WHERE o.codigo IN ('ORC-ATD-0001', 'ORC-MNT-0001', 'ORC-AVL-0001')
  AND NOT EXISTS (
      SELECT 1
      FROM orcamento_itens oi
      WHERE oi.id_orcamento = o.id
        AND oi.ordem = 2
  );

INSERT INTO orcamento_itens (
    id_orcamento,
    tipo_item,
    id_produto,
    id_servico,
    descricao,
    quantidade,
    valor_unitario,
    percentual_desconto,
    valor_desconto,
    valor_total,
    ordem
)
SELECT
    o.id,
    'PRODUTO',
    p.id,
    NULL,
    p.nome,
    3.000,
    p.valor_venda,
    3.00,
    ROUND((3 * p.valor_venda) * 0.03, 2),
    ROUND((3 * p.valor_venda) * 0.97, 2),
    1
FROM orcamentos o
JOIN produtos p ON p.codigo = 'PRD-0002'
WHERE o.codigo IN ('ORC-ATD-0002', 'ORC-MNT-0002', 'ORC-AVL-0002')
  AND NOT EXISTS (
      SELECT 1
      FROM orcamento_itens oi
      WHERE oi.id_orcamento = o.id
        AND oi.ordem = 1
  );

INSERT INTO orcamento_itens (
    id_orcamento,
    tipo_item,
    id_produto,
    id_servico,
    descricao,
    quantidade,
    valor_unitario,
    percentual_desconto,
    valor_desconto,
    valor_total,
    ordem
)
SELECT
    o.id,
    'SERVICO',
    NULL,
    s.id,
    s.nome,
    2.000,
    s.valor_padrao,
    0.00,
    0.00,
    ROUND(2 * s.valor_padrao, 2),
    2
FROM orcamentos o
JOIN servicos s ON s.codigo = 'SRV-0002'
WHERE o.codigo IN ('ORC-ATD-0002', 'ORC-MNT-0002', 'ORC-AVL-0002')
  AND NOT EXISTS (
      SELECT 1
      FROM orcamento_itens oi
      WHERE oi.id_orcamento = o.id
        AND oi.ordem = 2
  );

INSERT INTO vendas (
    codigo,
    id_orcamento,
    origem_tipo,
    cliente_nome,
    cliente_documento,
    status,
    data_venda,
    forma_pagamento,
    quantidade_parcelas,
    subtotal,
    total_desconto,
    total_acrescimo,
    total_geral,
    observacoes
)
SELECT
    CONCAT('VEN-', LPAD(o.id, 4, '0')),
    o.id,
    o.origem_tipo,
    o.cliente_nome,
    o.cliente_documento,
    'ABERTA',
    DATE_ADD('2026-04-25 09:00:00', INTERVAL o.id DAY),
    ELT(((o.id - 1) MOD 3) + 1, 'PIX', 'BOLETO', 'CARTAO'),
    2,
    o.subtotal,
    o.total_desconto,
    o.total_acrescimo,
    o.total_geral,
    CONCAT('Venda de teste vinculada ao orcamento ', o.codigo, '.')
FROM orcamentos o
WHERE o.status = 'APROVADO'
  AND NOT EXISTS (
      SELECT 1
      FROM vendas v
      WHERE v.id_orcamento = o.id
  );

INSERT INTO venda_itens (
    id_venda,
    tipo_item,
    id_produto,
    id_servico,
    descricao,
    quantidade,
    valor_unitario,
    percentual_desconto,
    valor_desconto,
    valor_total
)
SELECT
    v.id,
    oi.tipo_item,
    oi.id_produto,
    oi.id_servico,
    oi.descricao,
    oi.quantidade,
    oi.valor_unitario,
    oi.percentual_desconto,
    oi.valor_desconto,
    oi.valor_total
FROM vendas v
JOIN orcamento_itens oi ON oi.id_orcamento = v.id_orcamento
WHERE NOT EXISTS (
    SELECT 1
    FROM venda_itens vi
    WHERE vi.id_venda = v.id
);

INSERT INTO parcelas (
    id_venda,
    numero_parcela,
    data_vencimento,
    status,
    valor_previsto,
    valor_pago,
    saldo_aberto,
    data_ultimo_pagamento,
    observacoes
)
SELECT
    v.id,
    1,
    DATE_ADD(DATE('2026-05-05'), INTERVAL v.id DAY),
    'PARCIAL',
    ROUND(v.total_geral / 2, 2),
    150.00,
    ROUND((v.total_geral / 2) - 150.00, 2),
    DATE_ADD('2026-05-01 14:00:00', INTERVAL v.id DAY),
    'Primeira parcela com pagamento parcial de teste.'
FROM vendas v
WHERE NOT EXISTS (
    SELECT 1
    FROM parcelas p
    WHERE p.id_venda = v.id
      AND p.numero_parcela = 1
);

INSERT INTO parcelas (
    id_venda,
    numero_parcela,
    data_vencimento,
    status,
    valor_previsto,
    valor_pago,
    saldo_aberto,
    data_ultimo_pagamento,
    observacoes
)
SELECT
    v.id,
    2,
    DATE_ADD(DATE('2026-06-05'), INTERVAL v.id DAY),
    'ABERTA',
    ROUND(v.total_geral / 2, 2),
    0.00,
    ROUND(v.total_geral / 2, 2),
    NULL,
    'Segunda parcela em aberto para homologacao.'
FROM vendas v
WHERE NOT EXISTS (
    SELECT 1
    FROM parcelas p
    WHERE p.id_venda = v.id
      AND p.numero_parcela = 2
);

INSERT INTO pagamentos (
    codigo,
    id_parcela,
    data_pagamento,
    forma_pagamento,
    valor_pago,
    observacoes
)
SELECT
    CONCAT('PAG-', LPAD(p.id, 4, '0')),
    p.id,
    COALESCE(p.data_ultimo_pagamento, '2026-05-01 14:00:00'),
    'PIX',
    p.valor_pago,
    'Pagamento de teste vinculado a parcela parcial.'
FROM parcelas p
WHERE p.numero_parcela = 1
  AND p.valor_pago > 0
  AND NOT EXISTS (
      SELECT 1
      FROM pagamentos pg
      WHERE pg.id_parcela = p.id
  );

INSERT INTO outbox_eventos (
    aggregate_type,
    aggregate_id,
    event_type,
    payload,
    status,
    tentativas,
    disponivel_em,
    processado_em,
    erro
)
SELECT
    'ORCAMENTO',
    o.id,
    'ORCAMENTO_ATUALIZADO',
    JSON_OBJECT(
        'orcamentoId', o.id,
        'codigo', o.codigo,
        'origemTipo', o.origem_tipo,
        'status', o.status,
        'totalGeral', o.total_geral,
        'clienteNome', o.cliente_nome
    ),
    'PROCESSADO',
    1,
    DATE_ADD('2026-05-01 08:00:00', INTERVAL o.id MINUTE),
    DATE_ADD('2026-05-01 08:05:00', INTERVAL o.id MINUTE),
    NULL
FROM orcamentos o
WHERE o.codigo IN ('ORC-ATD-0001', 'ORC-MNT-0001', 'ORC-AVL-0001')
  AND NOT EXISTS (
      SELECT 1
      FROM outbox_eventos oe
      WHERE oe.aggregate_type = 'ORCAMENTO'
        AND oe.aggregate_id = o.id
        AND oe.event_type = 'ORCAMENTO_ATUALIZADO'
  );

INSERT INTO outbox_eventos (
    aggregate_type,
    aggregate_id,
    event_type,
    payload,
    status,
    tentativas,
    disponivel_em,
    processado_em,
    erro
)
SELECT
    'VENDA',
    v.id,
    'VENDA_GERADA',
    JSON_OBJECT(
        'vendaId', v.id,
        'codigo', v.codigo,
        'orcamentoId', v.id_orcamento,
        'origemTipo', v.origem_tipo,
        'clienteNome', v.cliente_nome,
        'totalGeral', v.total_geral
    ),
    'PROCESSADO',
    1,
    DATE_ADD('2026-05-01 09:00:00', INTERVAL v.id MINUTE),
    DATE_ADD('2026-05-01 09:04:00', INTERVAL v.id MINUTE),
    NULL
FROM vendas v
WHERE NOT EXISTS (
    SELECT 1
    FROM outbox_eventos oe
    WHERE oe.aggregate_type = 'VENDA'
      AND oe.aggregate_id = v.id
      AND oe.event_type = 'VENDA_GERADA'
);

INSERT INTO outbox_eventos (
    aggregate_type,
    aggregate_id,
    event_type,
    payload,
    status,
    tentativas,
    disponivel_em,
    processado_em,
    erro
)
SELECT
    'PAGAMENTO',
    pg.id,
    'PAGAMENTO_REGISTRADO',
    JSON_OBJECT(
        'pagamentoId', pg.id,
        'parcelaId', pg.id_parcela,
        'codigo', pg.codigo,
        'formaPagamento', pg.forma_pagamento,
        'valorPago', pg.valor_pago
    ),
    'PROCESSADO',
    1,
    DATE_ADD('2026-05-01 10:00:00', INTERVAL pg.id MINUTE),
    DATE_ADD('2026-05-01 10:03:00', INTERVAL pg.id MINUTE),
    NULL
FROM pagamentos pg
WHERE pg.codigo LIKE 'PAG-%'
  AND NOT EXISTS (
      SELECT 1
      FROM outbox_eventos oe
      WHERE oe.aggregate_type = 'PAGAMENTO'
        AND oe.aggregate_id = pg.id
        AND oe.event_type = 'PAGAMENTO_REGISTRADO'
  );
