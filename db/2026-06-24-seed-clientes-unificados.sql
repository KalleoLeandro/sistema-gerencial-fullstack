USE sistema_gerencial_fullstack;

INSERT IGNORE INTO login (id, nome, login, senha, perfil) VALUES
    (2, 'Comercial User', 'comercial', 'comercial', 'COMERCIAL'),
    (3, 'Dev User', 'dev', 'dev', 'DEV'),
    (4, 'Tecnico User', 'tecnico', 'tecnico', 'ADMIN');

INSERT IGNORE INTO clientes (
    id, id_usuario_criacao, tipo_cadastro, tipo_pessoa, nome_fantasia, razao_social, nome, cpf, cnpj,
    documento_normalizado, inscricao, possui_contrato, teve_contrato, infraestrutura, data_inicio, data_fim,
    endereco, numero, complemento, bairro, cidade, uf, cep, telefone, celular, email, contato
) VALUES
    (1, 1, 'CLIENTE', 'j', 'Leal Informatica', 'Leal Informatica LTDA', 'Leal Informatica', NULL, '12.345.678/0001-90',
     '12345678000190', '1001', TRUE, TRUE, 'Contrato mensal de suporte e monitoramento',
     '2026-01-10 08:00:00', '2026-12-31 18:00:00', 'Rua das Flores', 120, 'Sala 2', 'Centro', 'Sao Paulo', 'SP', '01000-000',
     '(11) 3333-1000', '(11) 98888-1000', 'contato@lealinformatica.com', 'Fabio Freitas'),
    (2, 2, 'CLIENTE', 'j', 'Mercado Central', 'Mercado Central Comercio LTDA', 'Mercado Central', NULL, '98.765.432/0001-10',
     '98765432000110', '1002', TRUE, TRUE, 'Suporte em PDVs, impressoras e automacao comercial',
     '2026-02-05 09:00:00', '2026-11-30 17:30:00', 'Avenida Brasil', 450, 'Loja A', 'Jardins', 'Campinas', 'SP', '13000-100',
     '(19) 3222-2000', '(19) 97777-2000', 'ti@mercadocentral.com', 'Marina Souza'),
    (3, 2, 'CLIENTE', 'j', 'Clinica Vida', 'Clinica Vida Integrada LTDA', 'Clinica Vida', NULL, '45.678.901/0001-55',
     '45678901000155', '1003', FALSE, TRUE, 'Historico de infraestrutura e backup',
     '2025-03-01 08:30:00', '2026-03-31 18:00:00', 'Rua da Saude', 88, '3 andar', 'Boa Vista', 'Sorocaba', 'SP', '18000-200',
     '(15) 3111-3000', '(15) 96666-3000', 'suporte@clinicavida.com', 'Juliana Prado'),
    (4, 2, 'CLIENTE', 'f', 'Carlos Henrique', NULL, 'Carlos Henrique', '123.456.789-00', NULL,
     '12345678900', NULL, FALSE, FALSE, NULL,
     NULL, NULL, 'Rua das Flores', 120, 'Apto 11', 'Centro', 'Sao Paulo', 'SP', '01000-000',
     '(11) 3000-1000', '(11) 98888-1111', 'carlos@email.com', 'Carlos'),
    (5, 2, 'CLIENTE', 'f', 'Patricia Almeida', NULL, 'Patricia Almeida', '234.567.890-11', NULL,
     '23456789011', NULL, FALSE, FALSE, NULL,
     NULL, NULL, 'Rua da Saude', 88, 'Casa', 'Boa Vista', 'Sorocaba', 'SP', '18000-200',
     '(15) 3111-3000', '(15) 96666-3000', 'patricia.almeida@email.com', 'Patricia'),
    (6, 1, 'CLIENTE', 'f', 'Consumidor Final', NULL, 'Consumidor Final', NULL, NULL,
     NULL, NULL, FALSE, FALSE, NULL,
     NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
     NULL, NULL, NULL, NULL);

INSERT IGNORE INTO contrato_renovacoes (
    id, id_cliente, data_inicio_anterior, data_fim_anterior, data_inicio_novo, data_fim_novo, observacoes
) VALUES
    (1, 1, '2025-01-10 08:00:00', '2025-12-31 18:00:00', '2026-01-10 08:00:00', '2026-12-31 18:00:00', 'Renovacao anual do contrato de suporte.'),
    (2, 2, '2025-02-05 09:00:00', '2026-02-04 17:30:00', '2026-02-05 09:00:00', '2026-11-30 17:30:00', 'Ajuste comercial com novo escopo de PDV.');

INSERT IGNORE INTO equipamentos (
    id, id_usuario_criacao, nome_maquina, setor, tipo_equipamento, placa_mae,
    modelo, marca, numero_serie, processador, memoria, hd_ssd, fonte, gabinete,
    id_empresa, observacoes
) VALUES
    (1, 1, 'Servidor Principal', 'TI', 'SERVIDOR', 'Supermicro X11', 'PowerEdge T440', 'Dell', 'SRV-001', 'Xeon Silver', '64GB', '2TB SSD', '750W', 'Rack 4U', 1, 'Servidor com monitoramento remoto'),
    (2, 2, 'Caixa Loja 01', 'Frente de Caixa', 'DESKTOP', 'Asus B560', 'OptiPlex 7090', 'Dell', 'PDV-001', 'Core i5', '16GB', '512GB SSD', '500W', 'Mini Tower', 2, 'PDV principal da loja'),
    (3, 2, 'Recepcao 01', 'Recepcao', 'NOTEBOOK', 'Integrada', 'Latitude 5420', 'Dell', 'NTB-5420', 'Core i7', '16GB', '512GB SSD', 'Original', 'Notebook', 3, 'Notebook usado pela recepcao');

INSERT IGNORE INTO produtos (
    id, id_usuario_criacao, codigo, nome, descricao, unidade_medida,
    valor_custo, valor_venda, estoque_atual, estoque_minimo, ativo
) VALUES
    (1, 1, 'PRD-001', 'Mouse USB KNUP G14', 'Mouse com fio USB ergonomico', 'UN', 18.50, 37.50, 12.000, 3.000, TRUE),
    (2, 1, 'PRD-002', 'Teclado USB Slim', 'Teclado padrao ABNT2', 'UN', 35.00, 69.90, 8.000, 2.000, TRUE),
    (3, 1, 'PRD-003', 'Headphone Bluetooth KA-B05', 'Headphone sem fio dobravel', 'UN', 29.00, 49.90, 5.000, 2.000, TRUE),
    (4, 1, 'PRD-004', 'Papel Sulfite A4', 'Resma de papel A4 75g', 'UN', 18.00, 29.90, 20.000, 5.000, TRUE),
    (5, 1, 'PRD-005', 'SSD 480GB', 'Unidade de armazenamento SSD SATA', 'UN', 145.00, 249.90, 6.000, 2.000, TRUE),
    (6, 1, 'PRD-006', 'Cabo HDMI 2m', 'Cabo HDMI alta velocidade', 'UN', 12.00, 24.90, 15.000, 4.000, TRUE);

INSERT IGNORE INTO servicos (
    id, id_usuario_criacao, codigo, nome, descricao, valor_padrao, ativo
) VALUES
    (1, 1, 'SRV-001', 'Formatacao de computador', 'Formatacao completa com backup e restauracao', 180.00, TRUE),
    (2, 1, 'SRV-002', 'Instalacao de impressora', 'Instalacao de driver e configuracao em rede', 90.00, TRUE),
    (3, 1, 'SRV-003', 'Visita tecnica', 'Atendimento tecnico presencial', 150.00, TRUE),
    (4, 1, 'SRV-004', 'Digitalizacao de documentos', 'Digitalizacao por lote de documentos', 2.00, TRUE);

INSERT IGNORE INTO manutencao (
    id, id_usuario_criacao, id_equipamento, descricao, observacoes, data_inicio,
    data_fim, tipo_servico, valor_servico, valor_orcamento, executores,
    tipo_atendimento, status_atendimento, motivo_cancelamento, deslocamento,
    valor_deslocamento
) VALUES
    (1, 1, 1, 'Upgrade de armazenamento no servidor', 'Janela executada fora do horario comercial',
     '2026-04-05 19:00:00', '2026-04-05 22:00:00', 'PREVENTIVA', 320.00, 480.00, 'Fabio Freitas;Dev User', 'REMOTO', 2, NULL, 0, 0.00),
    (2, 2, 2, 'Troca de perifericos do caixa principal', 'Substituicao de mouse e teclado',
     '2026-05-10 09:00:00', '2026-05-10 11:00:00', 'CORRETIVA', 120.00, 220.00, 'Comercial User', 'PRESENCIAL', 1, NULL, 1, 35.00);

INSERT IGNORE INTO atendimentos (
    id, id_usuario_criacao, id_empresa, descricao, observacoes, data_inicio,
    data_fim, solicitante, executores, valor_servico, valor_orcamento,
    tipo_atendimento, status_atendimento, motivo_cancelamento, deslocamento,
    valor_deslocamento
) VALUES
    (1, 2, 2, 'Instalacao de nova impressora termica no caixa 2', 'Necessario ajustar compartilhamento no Windows',
     '2026-05-15 14:00:00', '2026-05-15 16:00:00', 'Marina Souza', 'Comercial User', 90.00, 190.00, 'PRESENCIAL', 2, NULL, 1, 30.00),
    (2, 1, 3, 'Configuracao de rotina de backup', 'Inclusao de backup local e nuvem',
     '2026-05-20 10:00:00', '2026-05-20 12:00:00', 'Juliana Prado', 'Fabio Freitas;Dev User', 250.00, 380.00, 'REMOTO', 1, NULL, 0, 0.00);

INSERT IGNORE INTO avulsos (
    id, id_usuario_criacao, nome_cliente, razao_social, data_inicio, data_fim,
    tipo_pessoa, cpf_cnpj, ie, executores, descricao, observacoes, valor_servico,
    valor_orcamento, endereco, numero, complemento, bairro, cidade, uf, cep,
    telefone, celular, email, contato, forma_pagamento, tipo_atendimento,
    status_atendimento, motivo_cancelamento, deslocamento, valor_deslocamento, total
) VALUES
    (1, 2, 'Patricia Almeida', NULL, '2026-05-18 08:30:00', '2026-05-18 10:00:00',
     'F', '234.567.890-11', NULL, 'Comercial User', 'Formatacao e limpeza de notebook pessoal', 'Cliente solicitou backup de fotos',
     180.00, 230.00, 'Rua da Saude', 88, 'Casa', 'Boa Vista', 'Sorocaba', 'SP', '18000-200',
     '(15) 3111-3000', '(15) 96666-3000', 'patricia.almeida@email.com', 'Patricia', 'PIX', 'PRESENCIAL', 2, NULL, 1, 20.00, 200.00),
    (2, 1, 'Carlos Henrique', NULL, '2026-05-25 13:00:00', '2026-05-25 14:30:00',
     'F', '123.456.789-00', NULL, 'Fabio Freitas', 'Instalacao de SSD e clonagem de sistema', 'Notebook entregue no balcao',
     250.00, 320.00, 'Rua das Flores', 120, 'Apto 11', 'Centro', 'Sao Paulo', 'SP', '01000-000',
     '(11) 3000-1000', '(11) 98888-1111', 'carlos@email.com', 'Carlos', 'CARTAO_CREDITO', 'BALCAO', 1, NULL, 0, 0.00, 250.00);

INSERT IGNORE INTO avulso_pagamentos (
    id, codigo, id_avulso, data_pagamento, forma_pagamento, valor_pago, observacoes
) VALUES
    (1, 'AVL-PAG-001', 1, '2026-05-18 10:05:00', 'PIX', 200.00, 'Pagamento integral'),
    (2, 'AVL-PAG-002', 2, '2026-05-25 14:35:00', 'CARTAO_CREDITO', 250.00, 'Pagamento aprovado no POS');

INSERT IGNORE INTO agendamentos (
    id, id_usuario_criacao, titulo, tipo_tarefa, data_agendamento, detalhes, concluido
) VALUES
    (1, 1, 'Reuniao com Mercado Central', 'REUNIAO', '2026-06-10 09:00:00', 'Apresentar proposta de renovacao contratual', FALSE),
    (2, 2, 'Visita tecnica Clinica Vida', 'VISITA', '2026-06-11 14:00:00', 'Validar rotina de backup e antivirus', FALSE),
    (3, 3, 'Retorno Patricia Almeida', 'FOLLOW_UP', '2026-06-12 11:30:00', 'Confirmar estabilidade do notebook apos formatacao', TRUE);

INSERT IGNORE INTO orcamentos (
    id, id_usuario_criacao, codigo, origem_tipo, id_atendimento, id_manutencao,
    id_avulso, cliente_nome, cliente_documento, status, validade_em, aprovado_em,
    desconto_financeiro, acrescimo_financeiro, subtotal, total_desconto,
    total_acrescimo, total_geral, observacoes, criado_em, atualizado_em
) VALUES
    (1, 2, 'ORC-2026-001', 'ATENDIMENTO', 1, NULL, NULL, 'Mercado Central Comercio LTDA', '98.765.432/0001-10', 'ABERTO',
     '2026-06-30', NULL, 10.00, 0.00, 259.80, 10.00, 0.00, 249.80, 'Orcamento para caixa 2', '2026-06-01 09:00:00', '2026-06-01 09:00:00'),
    (2, 1, 'ORC-2026-002', 'MANUTENCAO', NULL, 1, NULL, 'Leal Informatica', '12.345.678/0001-90', 'APROVADO',
     '2026-06-15', '2026-06-03 10:00:00', 0.00, 15.00, 729.80, 0.00, 15.00, 744.80, 'Upgrade aprovado pelo cliente', '2026-06-02 08:30:00', '2026-06-03 10:00:00'),
    (3, 2, 'ORC-2026-003', 'AVULSO', NULL, NULL, 1, 'Patricia Almeida', '234.567.890-11', 'REJEITADO',
     '2026-06-20', NULL, 20.00, 0.00, 429.90, 20.00, 0.00, 409.90, 'Cliente achou o prazo alto', '2026-06-05 13:20:00', '2026-06-06 17:00:00'),
    (4, 2, 'ORC-2026-004', 'LIVRE', NULL, NULL, NULL, 'Carlos Henrique', '123.456.789-00', 'ABERTO',
     '2026-07-05', NULL, 0.00, 0.00, 339.80, 0.00, 0.00, 339.80, 'Orcamento livre gerado no balcao', '2026-06-08 11:15:00', '2026-06-08 11:15:00');

INSERT IGNORE INTO orcamento_itens (
    id, id_orcamento, tipo_item, id_produto, id_servico, descricao, quantidade,
    valor_unitario, percentual_desconto, valor_desconto, valor_total, ordem,
    criado_em, atualizado_em
) VALUES
    (1, 1, 'PRODUTO', 1, NULL, 'Mouse USB KNUP G14', 2.000, 37.50, 0.00, 0.00, 75.00, 1, '2026-06-01 09:00:00', '2026-06-01 09:00:00'),
    (2, 1, 'SERVICO', NULL, 2, 'Instalacao de impressora', 1.000, 90.00, 0.00, 0.00, 90.00, 2, '2026-06-01 09:00:00', '2026-06-01 09:00:00'),
    (3, 1, 'PRODUTO', 6, NULL, 'Cabo HDMI 2m', 2.000, 24.90, 0.00, 0.00, 49.80, 3, '2026-06-01 09:00:00', '2026-06-01 09:00:00'),
    (4, 2, 'PRODUTO', 5, NULL, 'SSD 480GB', 2.000, 249.90, 0.00, 0.00, 499.80, 1, '2026-06-02 08:30:00', '2026-06-03 10:00:00'),
    (5, 2, 'SERVICO', NULL, 3, 'Visita tecnica', 1.000, 150.00, 0.00, 0.00, 150.00, 2, '2026-06-02 08:30:00', '2026-06-03 10:00:00'),
    (6, 2, 'PRODUTO', 6, NULL, 'Cabo HDMI 2m', 2.000, 24.90, 0.00, 0.00, 49.80, 3, '2026-06-02 08:30:00', '2026-06-03 10:00:00');

INSERT IGNORE INTO vendas (
    id, id_usuario_criacao, codigo, id_orcamento, origem_tipo, cliente_nome,
    cliente_documento, status, data_venda, forma_pagamento, subtotal,
    total_desconto, total_acrescimo, total_geral, observacoes, criado_em, atualizado_em
) VALUES
    (1, 1, 'VDA-2026-001', 2, 'MANUTENCAO', 'Leal Informatica', '12.345.678/0001-90', 'FINALIZADA', '2026-06-03 10:15:00',
     'PIX', 729.80, 0.00, 15.00, 744.80, 'Venda gerada a partir do orcamento aprovado', '2026-06-03 10:15:00', '2026-06-03 10:15:00'),
    (2, 2, 'VDA-2026-002', NULL, 'PDV', 'Consumidor Final', NULL, 'FINALIZADA', '2026-06-09 16:20:00',
     'MULTIPLO', 174.70, 0.00, 0.00, 174.70, 'Venda direta no PDV', '2026-06-09 16:20:00', '2026-06-09 16:20:00');

INSERT IGNORE INTO venda_itens (
    id, id_venda, tipo_item, id_produto, id_servico, descricao, quantidade,
    valor_unitario, percentual_desconto, valor_desconto, valor_total, criado_em, atualizado_em
) VALUES
    (1, 1, 'PRODUTO', 5, NULL, 'SSD 480GB', 2.000, 249.90, 0.00, 0.00, 499.80, '2026-06-03 10:15:00', '2026-06-03 10:15:00'),
    (2, 1, 'SERVICO', NULL, 3, 'Visita tecnica', 1.000, 150.00, 0.00, 0.00, 150.00, '2026-06-03 10:15:00', '2026-06-03 10:15:00'),
    (3, 1, 'PRODUTO', 6, NULL, 'Cabo HDMI 2m', 2.000, 24.90, 0.00, 0.00, 49.80, '2026-06-03 10:15:00', '2026-06-03 10:15:00'),
    (4, 2, 'PRODUTO', 1, NULL, 'Mouse USB KNUP G14', 1.000, 37.50, 0.00, 0.00, 37.50, '2026-06-09 16:20:00', '2026-06-09 16:20:00'),
    (5, 2, 'PRODUTO', 2, NULL, 'Teclado USB Slim', 1.000, 69.90, 0.00, 0.00, 69.90, '2026-06-09 16:20:00', '2026-06-09 16:20:00');

INSERT IGNORE INTO pagamentos (
    id, codigo, id_venda, data_pagamento, forma_pagamento, valor_pago, observacoes, criado_em
) VALUES
    (1, 'PAG-2026-001', 1, '2026-06-03 10:20:00', 'PIX', 744.80, 'Pagamento integral via PIX', '2026-06-03 10:20:00'),
    (2, 'PAG-2026-002', 2, '2026-06-09 16:22:00', 'DINHEIRO', 100.00, 'Entrada em dinheiro', '2026-06-09 16:22:00'),
    (3, 'PAG-2026-003', 2, '2026-06-09 16:23:00', 'CARTAO_DEBITO', 74.70, 'Complemento no cartao', '2026-06-09 16:23:00');

INSERT IGNORE INTO caixa_fechamentos (
    id, data_referencia, status, aberto_em, fechado_em, valor_total, valor_informado,
    valor_quebra, observacoes, id_usuario_abertura, id_usuario_fechamento, criado_em, atualizado_em
) VALUES
    (1, '2026-06-09', 'FECHADO', '2026-06-09 08:00:00', '2026-06-09 18:05:00',
     919.50, 919.50, 0.00, 'Fechamento sem divergencias', 2, 1, '2026-06-09 08:00:00', '2026-06-09 18:05:00');

INSERT IGNORE INTO caixa_fechamento_itens (
    id, id_caixa_fechamento, forma_pagamento, valor_total, quantidade_lancamentos,
    criado_em, atualizado_em
) VALUES
    (1, 1, 'PIX', 944.80, 2, '2026-06-09 18:05:00', '2026-06-09 18:05:00'),
    (2, 1, 'DINHEIRO', 100.00, 1, '2026-06-09 18:05:00', '2026-06-09 18:05:00'),
    (3, 1, 'CARTAO_DEBITO', 74.70, 1, '2026-06-09 18:05:00', '2026-06-09 18:05:00');

INSERT IGNORE INTO historico_alteracoes (
    id, tabela, nome_usuario, tipo_alteracao, data_alteracao, id_tabela
) VALUES
    (1, 'produtos', 'Master User', 'CADASTRO', '2026-05-01 09:00:00', 1),
    (2, 'clientes', 'Comercial User', 'CADASTRO', '2026-05-02 10:30:00', 2),
    (3, 'orcamentos', 'Fabio Freitas', 'APROVACAO', '2026-06-03 10:00:00', 2);

INSERT IGNORE INTO outbox_eventos (
    id, aggregate_type, aggregate_id, event_type, payload, status, tentativas,
    disponivel_em, processado_em, erro, criado_em, atualizado_em
) VALUES
    (1, 'VENDA', 1, 'VENDA_FINALIZADA',
     JSON_OBJECT('vendaId', 1, 'cliente', 'Leal Informatica', 'total', 744.80),
     'PROCESSADO', 1, '2026-06-03 10:15:00', '2026-06-03 10:15:02', NULL,
     '2026-06-03 10:15:00', '2026-06-03 10:15:02');
