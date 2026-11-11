-- Banco existente: as colunas valor_entregue e troco ja existem nas duas tabelas.
-- Por decisao do usuario, registros historicos desconhecidos assumem troco zero.
-- Valores conhecidos e os totais liquidos sao preservados.
USE sistema_gerencial_fullstack;

START TRANSACTION;
UPDATE pagamentos
SET valor_entregue = COALESCE(valor_entregue, valor_pago + COALESCE(troco, 0)),
    troco = COALESCE(troco, valor_entregue - valor_pago)
WHERE valor_entregue IS NULL OR troco IS NULL;

UPDATE caixa_fechamento_itens
SET valor_entregue = COALESCE(valor_entregue, valor_total + COALESCE(troco, 0)),
    troco = COALESCE(troco, valor_entregue - valor_total)
WHERE valor_entregue IS NULL OR troco IS NULL;
COMMIT;

-- As verificacoes permitem o par NULL para integracoes legadas, mas rejeitam
-- registros incompletos, troco negativo ou diferencas entre entregue e liquido.
SET @ddl = IF(EXISTS(SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = DATABASE() AND table_name = 'pagamentos'
      AND constraint_name = 'ck_pagamentos_troco'), 'SELECT 1',
    'ALTER TABLE pagamentos ADD CONSTRAINT ck_pagamentos_troco CHECK (
      (valor_entregue IS NULL AND troco IS NULL) OR
      (valor_entregue IS NOT NULL AND troco IS NOT NULL AND valor_pago >= 0
       AND troco >= 0 AND valor_entregue = valor_pago + troco
       AND (troco = 0 OR UPPER(TRIM(forma_pagamento)) = ''DINHEIRO'')))');
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @ddl = IF(EXISTS(SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = DATABASE() AND table_name = 'caixa_fechamento_itens'
      AND constraint_name = 'ck_caixa_itens_troco'), 'SELECT 1',
    'ALTER TABLE caixa_fechamento_itens ADD CONSTRAINT ck_caixa_itens_troco CHECK (
      (valor_entregue IS NULL AND troco IS NULL) OR
      (valor_entregue IS NOT NULL AND troco IS NOT NULL AND valor_total >= 0
       AND troco >= 0 AND valor_entregue = valor_total + troco
       AND (troco = 0 OR UPPER(TRIM(forma_pagamento)) = ''DINHEIRO'')))');
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
