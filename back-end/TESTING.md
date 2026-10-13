# Testes do back-end

Execute os comandos abaixo dentro de `back-end`, com Maven usando o JDK 27 (`mvn -version`).

```powershell
mvn "-Dmaven.repo.local=.m2/repository" clean verify
```

`clean verify` recompila o projeto, executa toda a suite, gera o JAR e verifica os limites de cobertura. `clean install` tambem executa essas verificacoes e instala o artefato no repositorio Maven local.

## Resultado validado

Em 13/10/2026, o build limpo executou **371 testes**, com zero falhas, erros ou testes ignorados.

| Medida JaCoCo | Cobertura |
| --- | ---: |
| Linhas | 96,06% (2.971 de 3.093) |
| Ramificacoes | 86,00% (602 de 700) |
| Instrucoes | 96,59% |
| Metodos | 98,05% |
| Classes | 100,00% (56 de 56 classes contabilizadas) |

A cobertura anterior de linhas era 3,39%. Classes visitadas nao significam que todos os seus caminhos foram testados; os relatorios mostram as linhas e ramificacoes restantes.

O JaCoCo bloqueia `verify` e `install` se a cobertura global cair abaixo de **90% das linhas** ou **80% das ramificacoes**. Nenhum pacote da aplicacao foi excluido para aumentar esses indicadores. O tratamento padrao do JaCoCo para codigo gerado pelo Lombok continua em vigor.

## Relatorios

- HTML navegavel: `target/site/jacoco/index.html`.
- XML para Sonar: `target/site/jacoco/jacoco.xml`, configurado explicitamente no POM.
- Resultados JUnit: `target/surefire-reports`.

Para executar apenas um grupo durante o desenvolvimento:

```powershell
mvn "-Dmaven.repo.local=.m2/repository" "-Dtest=FluxoComercialIntegrationTest,FluxoComercialTransactionTest" test
```

Uma execucao parcial pode deixar dados de cobertura acumulados em `target/jacoco.exec`. Use `clean verify` para medir toda a suite do zero.

## Escopo

- Fluxo comercial: criacao manual e automatica de orcamentos, PDV, descontos, arredondamento, parcelamento, pagamentos parciais, quitacao, rejeicao, reabertura, atualizacao de vendas e caixa.
- Transacoes: rollback de venda, parcelas e eventos quando o pagamento excede o saldo; preservacao dos itens existentes quando a atualizacao da venda falha.
- Cadastros e repositorios: SQL executado em banco isolado, persistencia, consultas, filtros, paginacao, atualizacao, exclusao e traducao de falhas do banco em erros de dominio.
- Atendimentos, manutencoes e avulsos: historico de abertura e alteracoes, justificativas de horario e transicoes de status.
- Autenticacao e seguranca: JWT assinado, expiracao e assinatura invalida, separacao de access/refresh tokens, cookies HttpOnly, renovacao, logout, filtro JWT, permissoes HTTP 401/403 e CORS.
- Imagens: validacao de arquivo, limite de tamanho, redimensionamento e proporcao, metadados, consultas e exclusao.
- Mensageria: publicacao, falha e continuidade do lote, retry da outbox, auditoria, notificacoes, dashboard e documentos gerados.
- HTTP: contratos dos controllers, desserializacao, parametros, status e respostas JSON/binarias.
- Dashboard: receitas, chamados por executor, estoque, contratos, calendario e agenda.

## Isolamento e limites

Os testes nao exigem MySQL, MongoDB ou RabbitMQ externos. Os repositorios usam H2 em modo MySQL, com um banco novo por teste e o schema de `../db/init.sql` copiado pelo Maven. O fixture adapta apenas `CREATE DATABASE`/`USE`, a representacao JSON, `DATE_FORMAT`, `DATE_ADD` e `DELETE` com join; essas adaptacoes ficam em `src/test`, sem alterar as consultas da aplicacao.

MongoDB e RabbitMQ sao substituidos por mocks nos testes, com verificacao dos documentos, consultas, publicacoes e falhas. Os testes de seguranca carregam uma slice MVC com o filtro e a configuracao reais; os testes HTTP standalone verificam contratos, enquanto as permissoes sao verificadas separadamente. O smoke test carrega o contexto Spring com clientes externos isolados.

Esta suite valida comportamento e transacoes locais. Ela nao certifica particularidades do servidor MySQL, transporte real do RabbitMQ ou persistencia real do MongoDB; esses cenarios exigem testes adicionais com os respectivos servidores.

O teste de paginacao tambem detectou e protege a correcao do total de equipamentos, que agora respeita a empresa selecionada.
