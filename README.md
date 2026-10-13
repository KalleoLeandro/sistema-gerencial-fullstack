# sistema-gerencial-fullstack

Aplicacao full stack com frontend Angular, BFF em NestJS e backend Spring Boot. As funcionalidades do projeto `sistema-controle-equipamentos` foram portadas para este sistema, preservando o fluxo via BFF e o template visual Frutiger Aero ja existente no frontend.

## Arquitetura

- Frontend: Angular com layout Frutiger Aero.
- BFF: NestJS na porta `3000`, responsavel por receber chamadas do frontend, encaminhar cookies/autorizacao e repassar para o backend.
- Backend: Java 27 e Spring Boot na porta `8080`, com contexto `/api`.
- Banco: MySQL `sistema_gerencial_fullstack`.
- Auditoria/documentos: MongoDB `sistema_gerencial_auditoria`.
- Mensageria: RabbitMQ com painel de administracao.

## URLs uteis

- Frontend dev: `http://localhost:4200`
- BFF base: `http://localhost:3000`
- Swagger BFF: `http://localhost:3000/api`
- Swagger alternativo BFF: `http://localhost:3000/api-docs`
- Backend base: `http://localhost:8080/api`
- Swagger backend: `http://localhost:8080/api/swagger-ui.html`
- MongoDB: `mongodb://root:root@localhost:27017`
- RabbitMQ AMQP: `amqp://guest:guest@localhost:5672`
- RabbitMQ painel: `http://localhost:15672`

## Build validada

- Backend (JDK 27): `mvn "-Dmaven.repo.local=.m2/repository" clean install` (371 testes; cobertura de linhas: 96,06%, ramificacoes: 86%). Veja [a documentacao da suite](back-end/TESTING.md).
- BFF: `npm run build`
- Frontend: `npm run build`

## Endpoints do Backend

Base URL: `http://localhost:8080/api`

## Endpoints do BFF

Base URL: `http://localhost:3000`

O BFF expõe as mesmas rotas funcionais consumidas pelo frontend e encaminha as requisicoes para o backend, preservando `cookie`, `authorization`, `query params`, `body` e `set-cookie`.

## Observacoes

- O frontend foi configurado para consumir o BFF como `apiUrl`.
- O backend permanece como fonte de negocio e persistencia.
- O BFF centraliza autenticacao baseada em cookies para o frontend.
- O build do frontend finalizou com sucesso, com warnings de budget CSS e dependencias CommonJS de bibliotecas legadas.
