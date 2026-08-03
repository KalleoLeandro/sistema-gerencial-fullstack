db = db.getSiblingDB("sistema_gerencial_auditoria");

db.createCollection("historico_eventos");
db.createCollection("imagens");
db.createCollection("notificacoes");
db.createCollection("documentos_gerados");
db.createCollection("dashboard_resumo");

db.historico_eventos.createIndex({ aggregateId: 1, criadoEm: -1 });
db.imagens.createIndex({ entityType: 1, entityId: 1, categoria: 1, principal: -1, criadoEm: 1 });
db.notificacoes.createIndex({ status: 1, criadoEm: -1 });
db.documentos_gerados.createIndex({ referenciaId: 1, tipo: 1 });
db.dashboard_resumo.createIndex({ ultimaAtualizacao: -1 });
