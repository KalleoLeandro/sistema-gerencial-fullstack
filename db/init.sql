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
    numero_serie varchar(50),
    processador VARCHAR(50),
    memoria VARCHAR(50),
    hd_ssd VARCHAR(50),
    fonte VARCHAR(50),
    gabinete VARCHAR(50),
    id_empresa INT NOT NULL,
    observacoes TEXT
);

ALTER TABLE equipamentos ADD FOREIGN KEY (id_empresa) REFERENCES empresas(id);

CREATE TABLE manutencao (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_equipamento INT NOT NULL,
    descricao TEXT NOT NULL,
    observacoes TEXT,
    data_inicio DATETIME NOT NULL,
    data_fim DATETIME NOT NULL,
    tipo_servico VARCHAR(50) NOT NULL,
    valor_servico DECIMAL(10,2) NOT NULL,
    valor_orcamento DECIMAL(10,2),
    executores TEXT,
    tipo_atendimento VARCHAR(20),
    status_atendimento INT DEFAULT 1,
    motivo_cancelamento TEXT,
    deslocamento INT,
    valor_deslocamento DECIMAL(10,2)
);

ALTER TABLE manutencao
ADD CONSTRAINT fk_historico_manutencao_equipamento
FOREIGN KEY (id_equipamento) REFERENCES equipamentos(id)
ON DELETE CASCADE;

CREATE TABLE atendimentos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_empresa INT NOT NULL,
    descricao TEXT NOT NULL,
    observacoes TEXT,
    data_inicio DATETIME NOT NULL,
    data_fim DATETIME NOT NULL,
    solicitante VARCHAR(50) NOT NULL,
    executores TEXT,
    valor_servico DECIMAL(10,2),
    valor_orcamento DECIMAL(10,2),
    tipo_atendimento VARCHAR(20),
    status_atendimento INT DEFAULT 1,
    motivo_cancelamento TEXT,
    deslocamento INT,
    valor_deslocamento DECIMAL(10,2)
);

ALTER TABLE atendimentos ADD FOREIGN KEY (id_empresa) REFERENCES empresas(id);

CREATE TABLE avulsos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome_cliente VARCHAR(100) NOT NULL,
    razao_social varchar(100),
    data_inicio DATETIME NULL,
    data_fim DATETIME NULL,
    tipo_pessoa CHAR NOT NULL,
    cpf_cnpj VARCHAR(20) NOT NULL,
    ie VARCHAR(20),
    executores TEXT NOT NULL,
    descricao TEXT NOT NULL,
    observacoes TEXT,
    valor_servico DECIMAL(10,2),
    valor_orcamento DECIMAL(10,2),
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
    valor_deslocamento DECIMAL(10,2),
    total DECIMAL(10,2)
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

INSERT INTO login (nome, login, senha, perfil)
SELECT 'Master User', 'admin', 'admin', 'ADMIN'
WHERE NOT EXISTS (
    SELECT 1 FROM login WHERE login = 'admin'
);
