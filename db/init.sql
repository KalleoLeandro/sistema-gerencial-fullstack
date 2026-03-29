CREATE DATABASE IF NOT EXISTS sistema_gerencial_fullstack;
USE sistema_gerencial_fullstack;

CREATE TABLE empresas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome_fantasia VARCHAR(100) NOT NULL,
    razao_social VARCHAR(100) NOT NULL,
    cnpj VARCHAR(20),
    ie VARCHAR(20),
    inscricao VARCHAR(10),
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
    contato VARCHAR(100)
);

CREATE TABLE equipamentos (
    id INT PRIMARY KEY AUTO_INCREMENT,
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
    CONSTRAINT fk_equipamentos_empresa FOREIGN KEY (id_empresa) REFERENCES empresas(id)
);

CREATE TABLE manutencao (
    id INT PRIMARY KEY AUTO_INCREMENT,
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
    CONSTRAINT fk_atendimentos_empresa FOREIGN KEY (id_empresa) REFERENCES empresas(id)
);

CREATE TABLE avulsos (
    id INT PRIMARY KEY AUTO_INCREMENT,
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
    tipo_atendimento VARCHAR(20),
    status_atendimento INT DEFAULT 1,
    motivo_cancelamento TEXT,
    deslocamento INT,
    valor_deslocamento DECIMAL(10,2) DEFAULT 0.00,
    total DECIMAL(10,2) DEFAULT 0.00
);

CREATE TABLE agendamentos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(150) NOT NULL,
    tipo_tarefa VARCHAR(100) NOT NULL,
    data_agendamento DATETIME NOT NULL,
    detalhes TEXT,
    concluido BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE login (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    login VARCHAR(64) UNIQUE NOT NULL,
    senha VARCHAR(64) NOT NULL,
    perfil VARCHAR(20) NOT NULL
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
    CONSTRAINT uq_orcamentos_atendimento UNIQUE (id_atendimento),
    CONSTRAINT uq_orcamentos_manutencao UNIQUE (id_manutencao),
    CONSTRAINT uq_orcamentos_avulso UNIQUE (id_avulso),
    CONSTRAINT fk_orcamentos_atendimento FOREIGN KEY (id_atendimento) REFERENCES atendimentos(id) ON DELETE CASCADE,
    CONSTRAINT fk_orcamentos_manutencao FOREIGN KEY (id_manutencao) REFERENCES manutencao(id) ON DELETE CASCADE,
    CONSTRAINT fk_orcamentos_avulso FOREIGN KEY (id_avulso) REFERENCES avulsos(id) ON DELETE CASCADE
);

CREATE TABLE orcamento_itens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_orcamento INT NOT NULL,
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
    codigo VARCHAR(40),
    id_orcamento INT NOT NULL,
    origem_tipo VARCHAR(20) NOT NULL,
    cliente_nome VARCHAR(120) NOT NULL,
    cliente_documento VARCHAR(20),
    status VARCHAR(30) NOT NULL DEFAULT 'ABERTA',
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
    CONSTRAINT uq_vendas_orcamento UNIQUE (id_orcamento),
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
    id_parcela INT NOT NULL,
    data_pagamento DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    forma_pagamento VARCHAR(30) NOT NULL,
    valor_pago DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    observacoes TEXT,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pagamentos_parcela FOREIGN KEY (id_parcela) REFERENCES parcelas(id)
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
CREATE INDEX idx_orcamentos_status ON orcamentos(status, origem_tipo);
CREATE INDEX idx_orcamentos_cliente ON orcamentos(cliente_nome);
CREATE INDEX idx_orcamento_itens_orcamento ON orcamento_itens(id_orcamento, ordem);
CREATE INDEX idx_vendas_status ON vendas(status, data_venda);
CREATE INDEX idx_venda_itens_venda ON venda_itens(id_venda);
CREATE INDEX idx_parcelas_status_vencimento ON parcelas(status, data_vencimento);
CREATE INDEX idx_pagamentos_data ON pagamentos(data_pagamento);
CREATE INDEX idx_outbox_eventos_status ON outbox_eventos(status, disponivel_em);
CREATE INDEX idx_outbox_eventos_aggregate ON outbox_eventos(aggregate_type, aggregate_id);

INSERT INTO login (nome, login, senha, perfil)
SELECT 'Master User', 'admin', 'admin', 'ADMIN'
WHERE NOT EXISTS (
    SELECT 1 FROM login WHERE login = 'admin'
);
