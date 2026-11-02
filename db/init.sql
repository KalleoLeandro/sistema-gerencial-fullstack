CREATE DATABASE IF NOT EXISTS sistema_gerencial_fullstack;
USE sistema_gerencial_fullstack;

CREATE TABLE login (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    login VARCHAR(64) UNIQUE NOT NULL,
    senha VARCHAR(64) NOT NULL,
    perfil VARCHAR(20) NOT NULL
);

CREATE TABLE clientes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario_criacao INT NULL,
    tipo_cadastro VARCHAR(20) NOT NULL DEFAULT 'EMPRESA',
    tipo_pessoa CHAR(1) NOT NULL DEFAULT 'j',
    nome_fantasia VARCHAR(120) NOT NULL,
    razao_social VARCHAR(120),
    nome VARCHAR(120),
    cpf VARCHAR(20),
    cnpj VARCHAR(20),
    documento_normalizado VARCHAR(20),
    inscricao VARCHAR(20),
    possui_contrato BOOLEAN NOT NULL DEFAULT FALSE,
    teve_contrato BOOLEAN NOT NULL DEFAULT FALSE,
    infraestrutura TEXT,
    data_inicio DATETIME NULL,
    data_fim DATETIME NULL,
    endereco VARCHAR(100),
    numero INT,
    complemento VARCHAR(50),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    uf VARCHAR(2),
    cep VARCHAR(15),
    telefone VARCHAR(20),
    celular VARCHAR(20),
    email VARCHAR(64),
    contato VARCHAR(100),
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_clientes_documento_normalizado UNIQUE (documento_normalizado)
);

CREATE TABLE contrato_renovacoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_cliente INT NOT NULL,
    data_inicio_anterior DATETIME NULL,
    data_fim_anterior DATETIME NULL,
    data_inicio_novo DATETIME NOT NULL,
    data_fim_novo DATETIME NOT NULL,
    observacoes TEXT,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_contrato_renovacoes_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id) ON DELETE CASCADE
);

CREATE TABLE equipamentos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario_criacao INT NULL,
    nome_maquina VARCHAR(50) NOT NULL,
    setor VARCHAR(50) NOT NULL,
    tipo_equipamento VARCHAR(20) NOT NULL,
    placa_mae VARCHAR(50),
    modelo VARCHAR(50),
    marca VARCHAR(50),
    numero_serie VARCHAR(50),
    processador VARCHAR(50),
    memoria VARCHAR(50),
    hd_ssd VARCHAR(50),
    fonte VARCHAR(50),
    gabinete VARCHAR(50),
    id_empresa INT NOT NULL,
    observacoes TEXT,
    CONSTRAINT fk_equipamentos_empresa FOREIGN KEY (id_empresa) REFERENCES clientes(id)
);

CREATE TABLE manutencao (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario_criacao INT NULL,
    id_equipamento INT NOT NULL,
    descricao TEXT NOT NULL,
    observacoes TEXT,
    data_inicio DATETIME NOT NULL,
    data_fim DATETIME NOT NULL,
    tipo_servico VARCHAR(50) NOT NULL,
    valor_servico DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    valor_orcamento DECIMAL(10,2) DEFAULT 0.00,
    executores TEXT,
    tipo_atendimento VARCHAR(20),
    status_atendimento INT DEFAULT 1,
    motivo_cancelamento TEXT,
    deslocamento INT,
    valor_deslocamento DECIMAL(10,2) DEFAULT 0.00,
    CONSTRAINT fk_manutencao_equipamento FOREIGN KEY (id_equipamento) REFERENCES equipamentos(id) ON DELETE CASCADE
);

CREATE TABLE atendimentos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario_criacao INT NULL,
    id_empresa INT NOT NULL,
    descricao TEXT NOT NULL,
    observacoes TEXT,
    data_inicio DATETIME NOT NULL,
    data_fim DATETIME NOT NULL,
    solicitante VARCHAR(50) NOT NULL,
    executores TEXT,
    valor_servico DECIMAL(10,2) DEFAULT 0.00,
    valor_orcamento DECIMAL(10,2) DEFAULT 0.00,
    tipo_atendimento VARCHAR(20),
    status_atendimento INT DEFAULT 1,
    motivo_cancelamento TEXT,
    deslocamento INT,
    valor_deslocamento DECIMAL(10,2) DEFAULT 0.00,
    CONSTRAINT fk_atendimentos_empresa FOREIGN KEY (id_empresa) REFERENCES clientes(id)
);

CREATE TABLE avulsos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario_criacao INT NULL,
    nome_cliente VARCHAR(100) NOT NULL,
    razao_social VARCHAR(100),
    data_inicio DATETIME NULL,
    data_fim DATETIME NULL,
    tipo_pessoa CHAR NOT NULL,
    cpf_cnpj VARCHAR(20) NOT NULL,
    ie VARCHAR(20),
    executores TEXT NOT NULL,
    descricao TEXT NOT NULL,
    observacoes TEXT,
    valor_servico DECIMAL(10,2) DEFAULT 0.00,
    valor_orcamento DECIMAL(10,2) DEFAULT 0.00,
    endereco VARCHAR(100),
    numero INT,
    complemento VARCHAR(50),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    uf VARCHAR(2),
    cep VARCHAR(15),
    telefone VARCHAR(20),
    celular VARCHAR(20),
    email VARCHAR(64),
    contato VARCHAR(100),
    forma_pagamento VARCHAR(30),
    tipo_atendimento VARCHAR(20),
    status_atendimento INT DEFAULT 1,
    motivo_cancelamento TEXT,
    deslocamento INT,
    valor_deslocamento DECIMAL(10,2) DEFAULT 0.00,
    total DECIMAL(10,2) DEFAULT 0.00
);

CREATE TABLE avulso_pagamentos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(40),
    id_avulso INT NOT NULL,
    data_pagamento DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    forma_pagamento VARCHAR(30) NOT NULL,
    valor_pago DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    observacoes TEXT,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_avulso_pagamentos_avulso FOREIGN KEY (id_avulso) REFERENCES avulsos(id) ON DELETE CASCADE
);

CREATE TABLE agendamentos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario_criacao INT NULL,
    titulo VARCHAR(150) NOT NULL,
    tipo_tarefa VARCHAR(100) NOT NULL,
    data_agendamento DATETIME NOT NULL,
    detalhes TEXT,
    concluido BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE historico_alteracoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tabela VARCHAR(50) NOT NULL,
    nome_usuario VARCHAR(100) NOT NULL,
    tipo_alteracao VARCHAR(50) NOT NULL,
    data_alteracao DATETIME NOT NULL,
    id_tabela INT NOT NULL
);

CREATE TABLE produtos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario_criacao INT NULL,
    codigo VARCHAR(40),
    nome VARCHAR(120) NOT NULL,
    descricao TEXT,
    unidade_medida VARCHAR(20) NOT NULL DEFAULT 'UN',
    valor_custo DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    valor_venda DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    estoque_atual DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    estoque_minimo DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE servicos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario_criacao INT NULL,
    codigo VARCHAR(40),
    nome VARCHAR(120) NOT NULL,
    descricao TEXT,
    valor_padrao DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE orcamentos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario_criacao INT NULL,
    codigo VARCHAR(40),
    origem_tipo VARCHAR(20) NOT NULL,
    id_atendimento INT NULL,
    id_manutencao INT NULL,
    id_avulso INT NULL,
    cliente_nome VARCHAR(120) NOT NULL,
    cliente_documento VARCHAR(20),
    status VARCHAR(30) NOT NULL DEFAULT 'ABERTO',
    validade_em DATE NULL,
    aprovado_em DATETIME NULL,
    desconto_financeiro DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    acrescimo_financeiro DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_desconto DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_acrescimo DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_geral DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    observacoes TEXT,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_orcamentos_atendimento FOREIGN KEY (id_atendimento) REFERENCES atendimentos(id) ON DELETE CASCADE,
    CONSTRAINT fk_orcamentos_manutencao FOREIGN KEY (id_manutencao) REFERENCES manutencao(id) ON DELETE CASCADE,
    CONSTRAINT fk_orcamentos_avulso FOREIGN KEY (id_avulso) REFERENCES avulsos(id) ON DELETE CASCADE
);

CREATE TABLE orcamento_itens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_orcamento INT NULL,
    tipo_item VARCHAR(20) NOT NULL,
    id_produto INT NULL,
    id_servico INT NULL,
    descricao VARCHAR(255) NOT NULL,
    quantidade DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    valor_unitario DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    percentual_desconto DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    valor_desconto DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    valor_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    ordem INT NOT NULL DEFAULT 1,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_orcamento_itens_orcamento FOREIGN KEY (id_orcamento) REFERENCES orcamentos(id) ON DELETE CASCADE,
    CONSTRAINT fk_orcamento_itens_produto FOREIGN KEY (id_produto) REFERENCES produtos(id),
    CONSTRAINT fk_orcamento_itens_servico FOREIGN KEY (id_servico) REFERENCES servicos(id)
);

CREATE TABLE vendas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario_criacao INT NULL,
    codigo VARCHAR(40),
    id_orcamento INT NULL,
    origem_tipo VARCHAR(20) NOT NULL,
    cliente_nome VARCHAR(120) NOT NULL,
    cliente_documento VARCHAR(20),
    status VARCHAR(30) NOT NULL DEFAULT 'FINALIZADA',
    data_venda DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    forma_pagamento VARCHAR(30),
    quantidade_parcelas INT NOT NULL DEFAULT 1,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_desconto DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_acrescimo DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_geral DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    observacoes TEXT,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_vendas_orcamento FOREIGN KEY (id_orcamento) REFERENCES orcamentos(id)
);

CREATE TABLE venda_itens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_venda INT NOT NULL,
    tipo_item VARCHAR(20) NOT NULL,
    id_produto INT NULL,
    id_servico INT NULL,
    descricao VARCHAR(255) NOT NULL,
    quantidade DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    valor_unitario DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    percentual_desconto DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    valor_desconto DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    valor_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_venda_itens_venda FOREIGN KEY (id_venda) REFERENCES vendas(id) ON DELETE CASCADE,
    CONSTRAINT fk_venda_itens_produto FOREIGN KEY (id_produto) REFERENCES produtos(id),
    CONSTRAINT fk_venda_itens_servico FOREIGN KEY (id_servico) REFERENCES servicos(id)
);

CREATE TABLE parcelas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_venda INT NOT NULL,
    numero_parcela INT NOT NULL,
    data_vencimento DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ABERTA',
    valor_previsto DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    valor_pago DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    saldo_aberto DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    data_ultimo_pagamento DATETIME NULL,
    observacoes TEXT,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_parcelas_venda_numero UNIQUE (id_venda, numero_parcela),
    CONSTRAINT fk_parcelas_venda FOREIGN KEY (id_venda) REFERENCES vendas(id) ON DELETE CASCADE
);

CREATE TABLE pagamentos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(40),
    id_parcela INT NULL,
    id_venda INT NULL,
    data_pagamento DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    forma_pagamento VARCHAR(30) NOT NULL,
    valor_pago DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    valor_entregue DECIMAL(12,2) NULL,
    troco DECIMAL(12,2) NULL,
    observacoes TEXT,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_pagamentos_troco CHECK (
        (valor_entregue IS NULL AND troco IS NULL) OR
        (valor_entregue IS NOT NULL AND troco IS NOT NULL AND valor_pago >= 0
         AND troco >= 0 AND valor_entregue = valor_pago + troco
         AND (troco = 0 OR UPPER(TRIM(forma_pagamento)) = 'DINHEIRO'))
    ),
    CONSTRAINT fk_pagamentos_parcela FOREIGN KEY (id_parcela) REFERENCES parcelas(id),
    CONSTRAINT fk_pagamentos_venda FOREIGN KEY (id_venda) REFERENCES vendas(id) ON DELETE CASCADE
);

CREATE TABLE caixa_fechamentos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    data_referencia DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ABERTO',
    aberto_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fechado_em DATETIME NULL,
    valor_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    valor_informado DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    valor_quebra DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    observacoes TEXT,
    id_usuario_abertura INT NULL,
    id_usuario_fechamento INT NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_caixa_fechamentos_data UNIQUE (data_referencia)
);

CREATE TABLE caixa_fechamento_itens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_caixa_fechamento INT NOT NULL,
    forma_pagamento VARCHAR(30) NOT NULL,
    valor_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    valor_entregue DECIMAL(12,2) NULL,
    troco DECIMAL(12,2) NULL,
    quantidade_lancamentos INT NOT NULL DEFAULT 0,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT ck_caixa_itens_troco CHECK (
        (valor_entregue IS NULL AND troco IS NULL) OR
        (valor_entregue IS NOT NULL AND troco IS NOT NULL AND valor_total >= 0
         AND troco >= 0 AND valor_entregue = valor_total + troco
         AND (troco = 0 OR UPPER(TRIM(forma_pagamento)) = 'DINHEIRO'))
    ),
    CONSTRAINT fk_caixa_fechamento_itens_fechamento FOREIGN KEY (id_caixa_fechamento) REFERENCES caixa_fechamentos(id) ON DELETE CASCADE
);

CREATE TABLE outbox_eventos (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    aggregate_type VARCHAR(50) NOT NULL,
    aggregate_id BIGINT NOT NULL,
    event_type VARCHAR(80) NOT NULL,
    payload JSON NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
    tentativas INT NOT NULL DEFAULT 0,
    disponivel_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processado_em DATETIME NULL,
    erro TEXT NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_produtos_nome ON produtos(nome);
CREATE INDEX idx_servicos_nome ON servicos(nome);
CREATE INDEX idx_clientes_nome_fantasia ON clientes(nome_fantasia);
CREATE INDEX idx_clientes_razao_social ON clientes(razao_social);
CREATE INDEX idx_clientes_cpf ON clientes(cpf);
CREATE INDEX idx_clientes_cnpj ON clientes(cnpj);
CREATE INDEX idx_clientes_documento_normalizado ON clientes(documento_normalizado);
CREATE INDEX idx_clientes_contrato ON clientes(possui_contrato, teve_contrato, data_fim);
CREATE INDEX idx_contrato_renovacoes_cliente ON contrato_renovacoes(id_cliente, data_fim_novo);
CREATE INDEX idx_orcamentos_status ON orcamentos(status, origem_tipo);
CREATE INDEX idx_orcamentos_cliente ON orcamentos(cliente_nome);
CREATE INDEX idx_orcamento_itens_orcamento ON orcamento_itens(id_orcamento, ordem);
CREATE INDEX idx_orcamentos_atendimento ON orcamentos(id_atendimento, id);
CREATE INDEX idx_orcamentos_manutencao ON orcamentos(id_manutencao, id);
CREATE INDEX idx_orcamentos_avulso ON orcamentos(id_avulso, id);
CREATE INDEX idx_vendas_orcamento ON vendas(id_orcamento, id);
CREATE INDEX idx_vendas_status ON vendas(status, data_venda);
CREATE INDEX idx_venda_itens_venda ON venda_itens(id_venda);
CREATE INDEX idx_parcelas_status_vencimento ON parcelas(status, data_vencimento);
CREATE INDEX idx_pagamentos_data ON pagamentos(data_pagamento, forma_pagamento);
CREATE INDEX idx_pagamentos_venda ON pagamentos(id_venda);
CREATE INDEX idx_avulso_pagamentos_data ON avulso_pagamentos(data_pagamento, forma_pagamento);
CREATE INDEX idx_caixa_fechamentos_data ON caixa_fechamentos(data_referencia, status);
CREATE INDEX idx_outbox_eventos_status ON outbox_eventos(status, disponivel_em);
CREATE INDEX idx_outbox_eventos_aggregate ON outbox_eventos(aggregate_type, aggregate_id);

INSERT INTO login (nome, login, senha, perfil)
SELECT 'Master User', 'admin', 'admin', 'ADMIN'
WHERE NOT EXISTS (
    SELECT 1 FROM login WHERE login = 'admin'
);

CREATE TABLE IF NOT EXISTS financeiro_contas (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tipo VARCHAR(10) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    contraparte VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NULL,
    referencia VARCHAR(100) NULL,
    entidade_tipo VARCHAR(50) NULL,
    entidade_id BIGINT NULL,
    vencimento DATE NOT NULL,
    valor DECIMAL(12,2) NOT NULL,
    valor_baixado DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    cancelada BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_financeiro_tipo_vencimento (tipo, vencimento)
);

CREATE TABLE IF NOT EXISTS financeiro_baixas (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    id_conta BIGINT NOT NULL,
    data_baixa DATE NOT NULL,
    valor DECIMAL(12,2) NOT NULL,
    forma_pagamento VARCHAR(30) NOT NULL,
    observacoes VARCHAR(1000) NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_financeiro_baixa_conta FOREIGN KEY (id_conta) REFERENCES financeiro_contas(id),
    INDEX idx_financeiro_baixa_data (data_baixa)
);
