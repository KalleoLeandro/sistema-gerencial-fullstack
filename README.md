<div align="center">

# 🧩 Sistema Gerencial Full Stack

### Gestão empresarial, atendimento técnico, operações comerciais e controle financeiro em uma arquitetura modular

![Java](https://img.shields.io/badge/Java-27-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Angular](https://img.shields.io/badge/Angular-Frontend-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-BFF-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)

[![MySQL](https://img.shields.io/badge/MySQL-Relacional-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Auditoria-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-Mensageria-FF6600?logo=rabbitmq&logoColor=white)](https://www.rabbitmq.com/)
[![Jenkins](https://img.shields.io/badge/Jenkins-CI%2FCD-D24939?logo=jenkins&logoColor=white)](https://www.jenkins.io/)

**Um projeto funcional, construído como laboratório prático para estudar front-end, BFF, APIs de negócio, persistência, mensageria, testes, observabilidade e CI/CD em uma solução integrada.**

[Funcionalidades](#-funcionalidades) · [Arquitetura](#-arquitetura) · [Execução](#-execução-local-com-docker) · [Qualidade](#-testes-e-qualidade) · [Documentação](#-documentação-adicional)

</div>

---

## ✨ Sobre o projeto

O **Sistema Gerencial Full Stack** é uma aplicação para organizar diferentes operações de uma empresa: relacionamento com clientes, cadastro de equipamentos, atendimento e manutenção, agenda, orçamentos, vendas, caixa e financeiro.

A solução foi construída com **Angular** na experiência web, **NestJS como Backend for Frontend (BFF)** e **Spring Boot** como camada central de regras de negócio. A persistência utiliza **MySQL** e **MongoDB**, com **RabbitMQ** para mensageria. A interface incorpora uma identidade visual inspirada no estilo **Frutiger Aero**.

Mais do que um protótipo isolado, este é um **projeto funcional**, com módulos reais, fluxos implementados, testes automatizados e infraestrutura de apoio. Ao mesmo tempo, ele foi concebido como um **ambiente de estudo prático**, com o objetivo de explorar de ponta a ponta as tecnologias envolvidas na construção de uma aplicação Full Stack moderna.

> 📌 **Escopo:** projeto funcional usado como laboratório de estudos e evolução contínua. A proposta é aprender e validar, em um único sistema, temas como arquitetura em camadas, BFF, APIs REST, autenticação, bancos de dados, mensageria, testes, observabilidade e CI/CD. A presença de um componente na infraestrutura não significa que exista implantação pública em produção.

## 🚀 Funcionalidades

| Área | Recursos documentados/identificados |
| --- | --- |
| 🏢 **Cadastros** | Empresas, clientes e equipamentos |
| 🛠️ **Atendimentos** | Registro, acompanhamento e alteração de status |
| 🔧 **Manutenções** | Operações e histórico de manutenção |
| 📅 **Agenda** | Agendamentos e eventos de calendário |
| 🧾 **Comercial** | Orçamentos, produtos, serviços e vendas |
| 💳 **Financeiro** | Contas a pagar e a receber, baixas parciais/totais e relatórios |
| 💰 **Caixa** | Registro e acompanhamento de recebimentos comerciais |
| 📊 **Dashboards** | Indicadores e consultas consolidadas para acompanhamento operacional |
| 🔐 **Acesso** | Autenticação JWT, cookies HttpOnly e autorização por perfis |
| 📨 **Integração** | Mensageria e fluxo de eventos entre componentes |

### 💳 Destaque: módulo financeiro

- Lançamentos manuais de **contas a pagar** e **contas a receber**.
- Integração com parcelas de vendas, sem duplicação dos títulos na base financeira.
- Pagamentos e recebimentos **parciais ou totais**, com validação transacional.
- Relatórios por período e categoria, incluindo **exportação CSV**.
- Regras de cancelamento e preservação de histórico.
- Acesso restrito aos perfis **ADMIN** e **DEV**.

Detalhes de implantação, migração e endpoints: [`FINANCEIRO.md`](FINANCEIRO.md).

### Configuração necessária por funcionalidade

Todos os módulos de negócio exigem Angular → BFF → API conectados, MySQL inicializado e usuário autenticado com permissão para a operação. Além dessa base:

| Item | O que preparar para funcionar |
| --- | --- |
| Cadastros | Inicializar as tabelas de `db/init.sql`. Cadastrar empresas/clientes antes dos registros que dependem deles e associar os equipamentos aos respectivos cadastros. |
| Atendimentos | Disponibilizar os cadastros de origem e os usuários executores; configurar RabbitMQ e MongoDB para os eventos e histórico. |
| Manutenções | Cadastrar os equipamentos e seus vínculos; configurar MongoDB e RabbitMQ para auditoria e processamento dos eventos. |
| Agenda | Cadastrar agendamentos e configurar o fuso de negócio em `APP_TIME_ZONE`, cujo padrão é `America/Sao_Paulo`. |
| Comercial | Criar produtos/serviços ou informar os itens no orçamento, aprovar e registrar pagamentos. As imagens dependem da conexão MongoDB. As tabelas comerciais estão em `db/init.sql`. |
| Financeiro | Usar perfil ADMIN/DEV e as tabelas `financeiro_contas` e `financeiro_baixas`, já presentes no init. Cadastrar contas manuais ou gerar parcelas de vendas; não há carga automática de contas/fornecedores. Ver `FINANCEIRO.md`. |
| Caixa | Registrar pagamentos nas vendas/serviços. Conferir as colunas `valor_entregue` e `troco` em `pagamentos` e `caixa_fechamento_itens`; para banco existente, revisar `db/migrations/20261101-troco.sql`. O fechamento consulta os valores do banco e não permite editá-los. |
| Dashboards | Cadastrar operações para alimentar os indicadores e manter RabbitMQ/MongoDB disponíveis para as projeções assíncronas. Os painéis técnicos dependem de Prometheus/Grafana, descritos abaixo. |
| Acesso | Ter usuário na tabela `login`, chave JWT no backend, par RSA compatível entre Angular/BFF e origens CORS corretas. Ver Segurança e autenticação. |
| Integração | Configurar a conexão RabbitMQ, exchange, fila e routing key; manter MongoDB disponível para auditoria e documentos. A API declara a topologia ao iniciar. |

## 🏗️ Arquitetura

```mermaid
flowchart TB
    U[👤 Usuário / Navegador] --> FE[Angular + Nginx]
    FE --> BFF[NestJS - BFF]
    BFF --> API[Spring Boot - API de negócio]

    API --> SQL[(MySQL)]
    API --> MONGO[(MongoDB)]
    API <--> MQ[RabbitMQ]

    API --> MET[Actuator / Micrometer]
    BFF --> PROM[Prometheus]
    MET --> PROM
    PROM -->|fonte de dados / consultas PromQL| GRAF[Grafana]

    JENKINS[Jenkins] --> FE
    JENKINS --> BFF
    JENKINS --> API
    FE --> SONAR[SonarQube]
    BFF --> SONAR
    API --> SONAR
    JENKINS --> SONAR
```

### Responsabilidades por camada

- **Angular:** telas, formulários, navegação, componentes visuais e consumo do BFF.
- **NestJS:** ponto de entrada do front-end, repasse de parâmetros e cabeçalhos, integração com cookies de autenticação e proxy para o serviço Java.
- **Spring Boot:** regras de negócio, segurança, validação, transações e integrações de dados.
- **MySQL:** dados relacionais de operações gerenciais e comerciais.
- **MongoDB:** armazenamento associado à auditoria e documentos.
- **RabbitMQ:** infraestrutura de eventos e processamento assíncrono.
- **Prometheus + Grafana:** o Prometheus coleta as métricas do back-end e do BFF; o Grafana consulta o Prometheus como fonte de dados para visualizar dashboards.
- **Jenkins + SonarQube:** pipeline, execução de build/testes e análise de qualidade de front-end, BFF e back-end.

## 🧰 Stack tecnológica

| Camada | Tecnologias |
| --- | --- |
| Front-end | Angular, TypeScript, Nginx |
| BFF | NestJS, Node.js, TypeScript |
| API | Java 27, Spring Boot 3.5, Spring Security, Spring JDBC/JPA |
| Dados | MySQL, MongoDB |
| Integração | RabbitMQ, REST, JWT |
| Qualidade | JUnit, JaCoCo, Jest, Karma, SonarQube |
| Observabilidade | Spring Actuator, Micrometer, Prometheus, Grafana |
| Infraestrutura | Docker, Docker Compose, Jenkins |

## 📂 Organização do repositório

```text
sistema-gerencial-fullstack/
├── back-end/          # API Java / Spring Boot
├── bff/               # Backend for Frontend NestJS
├── front-end/         # Aplicação Angular
├── db/                # Inicialização e migrações MySQL
├── ndb/               # Configuração MongoDB
├── mensageria/        # RabbitMQ
├── prometheus/        # Métricas
├── grafana/           # Dashboards e provisionamento
├── infraestrutura/    # Agente Jenkins e suporte
├── Jenkinsfile        # Pipeline CI/CD
├── docker-compose.yaml
├── FINANCEIRO.md
└── TESTING.md
```

## 🐳 Execução local com Docker

### Pré-requisitos

- Docker Engine ou Docker Desktop com Compose.
- JDK **27**, Maven, Node.js **22** e npm para gerar os artefatos locais. Node 22 é a versão usada no agente Jenkins do projeto.
- Bash para executar os scripts `build.sh` e `sonar.sh` (por exemplo, Git Bash ou WSL no Windows, com as ferramentas disponíveis nesse ambiente).
- Portas locais disponíveis para os serviços habilitados.
- Recursos suficientes para os containers de aplicação, bancos e ferramentas de observabilidade.

```bash
git clone https://github.com/KalleoLeandro/sistema-gerencial-fullstack.git
cd sistema-gerencial-fullstack

# Os Dockerfiles copiam artefatos locais; compile antes de construir as imagens.
bash build.sh

docker compose up -d --build
```

O [`build.sh`](build.sh) instala as dependências Node e compila backend, BFF e Angular. No backend, ele usa `mvn clean package -DskipTests`; portanto, esse atalho não executa a validação completa dos testes. Para validar testes e cobertura, use os comandos da seção **Testes e qualidade**.

Para executar também a análise SonarQube, configure as chaves dos projetos e os tokens e depois rode o script separado:

```bash
# Com o SonarQube iniciado e os tokens/endereços configurados:
bash sonar.sh
```

O [`sonar.sh`](sonar.sh) executa a análise Java pelo plugin Maven e chama `npm run sonar` no BFF e Angular. As chaves dos projetos são `back-end`, `bff` e `front-end`. **O `build.sh` atual não chama esse script automaticamente**, mesmo com tokens configurados.

Antes de usar `sonar.sh`, ajuste a URL do servidor e a autenticação: o trecho Maven possui `sonar.host.url` e `sonar.token` definidos no próprio script; substitua o token fixo por uma referência a uma variável de ambiente, como `"$SONAR_TOKEN"`, sem publicar seu valor. Para os scanners npm, disponibilize `SONAR_TOKEN` no ambiente de cada execução e revise `sonar.host.url` nos respectivos `sonar-project.properties`: fora da rede Docker, use `http://localhost:9000` em vez de `http://sonarqube:9000`. Se usar tokens separados por projeto, selecione o token correspondente em cada etapa. Para cobertura completa, execute antes os testes BFF/Angular, que geram `coverage/lcov.info`; o script Sonar não executa esses testes. A integração Jenkins descrita abaixo já separa os tokens por credenciais e gera os relatórios na pipeline.

Após a inicialização, os endpoints configurados no Compose são:

| Serviço | Endereço local |
| --- | --- |
| Interface Angular | http://localhost:4200 |
| BFF NestJS | http://localhost:3000 |
| Swagger BFF | http://localhost:3000/api |
| API Spring Boot | http://localhost:8080 (rotas como `/login` e `/financeiro`) |
| Swagger backend | http://localhost:8080/swagger-ui.html |
| RabbitMQ Management | http://localhost:15672 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 |
| SonarQube | http://localhost:9000 |
| Jenkins | http://localhost:8085 |

> ⚠️ **Segurança:** o Compose presente no repositório utiliza credenciais demonstrativas de desenvolvimento, inclusive `root/root`, `guest/guest` e senha padrão do Grafana. **Não exponha esses serviços à internet sem trocar as credenciais, restringir as portas e revisar as configurações de produção.**

A infraestrutura Jenkins inicia junto com os demais serviços, sem perfil opcional. Na primeira instalação, o agente aguarda a configuração do controlador e de `JENKINS_AGENT_SECRET`, descrita abaixo. Para acompanhar e encerrar:

```bash
docker compose logs -f
docker compose down
```

`docker compose down` não apaga os volumes persistentes por padrão. Evite `down -v` se quiser preservar os dados.

### Configuração de cada serviço

Os nomes dos serviços são endereços internos da rede Docker `minharede`. Use `localhost` e as portas publicadas ao acessar pelo computador. Dentro de um container, `localhost` aponta para o próprio container.

#### MySQL

- **Arquivos:** [`db/Dockerfile`](db/Dockerfile), [`db/init.sql`](db/init.sql) e serviço `mysql` no Compose. Banco `sistema_gerencial_fullstack`, porta `3306`, acesso demonstrativo `root/root`.
- **Primeira instalação:** o entrypoint executa o init somente se o volume `mysql-data` estiver vazio. O init cria as tabelas e o usuário da aplicação `admin/admin`, diferente do usuário MySQL.
- **Banco existente:** reconstruir a imagem ou alterar `init.sql` não atualiza o volume. Faça backup e aplique as migrações necessárias pelo cliente SQL; não execute o init completo sobre dados existentes. A migração de troco exige que as colunas `valor_entregue` e `troco` já existam nas duas tabelas; ela assume troco zero nos registros históricos desconhecidos e adiciona verificações de consistência.
- **Verificação:** `docker compose ps mysql` deve mostrar `healthy`; confira as tabelas no banco e o login da aplicação.

#### MongoDB

- **Arquivos:** [`ndb/init.js`](ndb/init.js), imagem MongoDB 7 e volume `mongodb-data`. O init cria coleções/índices em `sistema_gerencial_auditoria` na primeira inicialização do volume.
- **Conexão da API:** `SPRING_DATA_MONGODB_URI=mongodb://root:root@mongodb:27017/sistema_gerencial_auditoria?authSource=admin`. Fora do Docker, use `localhost` em vez de `mongodb`.
- **Credenciais:** ao alterá-las, ajuste também a URI da API e o healthcheck no Compose. Mudar as variáveis de inicialização não altera automaticamente usuários em um volume existente.
- **Verificação:** container `healthy` e documentos/histórico aparecendo após operações da aplicação.

#### RabbitMQ

- **Arquivos:** [`mensageria/Dockerfile`](mensageria/Dockerfile) e serviço `rabbitmq`. AMQP na porta `5672`; painel na `15672`, com `guest/guest` no ambiente local.
- **Conexão:** o Compose passa à API `SPRING_RABBITMQ_HOST`, `SPRING_RABBITMQ_PORT`, `SPRING_RABBITMQ_USERNAME` e `SPRING_RABBITMQ_PASSWORD`.
- **Topologia:** `APP_COMERCIAL_EXCHANGE`, `APP_COMERCIAL_QUEUE` e `APP_COMERCIAL_ROUTING_KEY` têm os padrões `fluxo-comercial.exchange`, `fluxo-comercial.queue` e `fluxo.comercial`. O backend declara esses itens; não é necessário criá-los manualmente. O lote da outbox usa `APP_COMERCIAL_OUTBOX_BATCH_SIZE` (padrão 20).
- **Verificação:** container `healthy`, fila com consumidor e eventos da outbox processados; consulte os logs da API/RabbitMQ se a conexão falhar.

#### API Spring Boot

- **Build:** gerar `back-end/target/sistema_gerencial_fullstack.jar` com JDK 27 e `mvn clean verify` antes do build Docker.
- **Configuração:** [`application.yaml`](back-end/src/main/resources/application.yaml), complementado por `application-dev.yaml` no perfil padrão `dev`. O Compose substitui as conexões locais pelos endereços Docker.
- **Variáveis:** `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`, `SPRING_DATA_MONGODB_URI` e as variáveis RabbitMQ. MySQL, MongoDB e RabbitMQ precisam estar saudáveis.
- **Personalização:** `APP_TIME_ZONE` define o fuso, `JWT_SECRET` a assinatura dos tokens e `APP_CORS_ALLOWED_ORIGINS` as origens aceitas. Para substituir os padrões no Docker, adicione as variáveis ao `environment` do backend no Compose. Colocá-las somente no `.env` da raiz não as injeta automaticamente nesse container.
- **Verificação:** `http://localhost:8080/actuator/health` e `http://localhost:8080/swagger-ui.html`. O backend não configura prefixo global `/api`.

#### BFF NestJS e Swagger

- **Build:** executar `npm ci` e `npm run build` em `bff` para gerar `dist` antes de construir a imagem.
- **Conexão:** o Compose passa `PORT=3000` e `BACK_END=http://back-end:8080`. Fora do Docker, use `BACK_END=http://localhost:8080`.
- **Configuração:** [`bff/src/environments/environments.ts`](bff/src/environments/environments.ts). A chave RSA `PRIVATE_KEY` precisa corresponder à chave pública do Angular; ela não é o `JWT_SECRET` da API.
- **CORS:** [`bff/src/main.ts`](bff/src/main.ts) permite as origens locais da interface com cookies. Para outro domínio/IP, inclua a origem da interface no CORS do BFF e da API e recompile os componentes alterados.
- **Verificação:** Swagger em `http://localhost:3000/api`, métricas em `/metrics` e login pela interface. Endpoints protegidos exigem os cookies obtidos pelo login.

#### Angular e Nginx

- **Build:** executar `npm ci` e `npm run build` em `front-end`. O Dockerfile copia `dist/front-end/browser` para o Nginx.
- **Endereços:** `apiUrl` e `BFF` em [`environment.ts`](front-end/src/app/environments/environment.ts) e `environment.development.ts` apontam para `http://localhost:3000`. Para acesso de outro computador, use o endereço do BFF acessível ao navegador, não o nome Docker `bff`.
- **Chaves:** `PUBLIC_KEY` precisa corresponder a `PRIVATE_KEY` do BFF. Os valores Angular são incorporados no build; após mudar endereço/chave, recompile e reconstrua `front-end-angular`. Variáveis adicionadas apenas ao Nginx não alteram o JavaScript compilado.
- **Rotas:** [`front-end/nginx.conf`](front-end/nginx.conf) configura o fallback das rotas Angular. O Compose publica a interface na porta `4200`.
- **Verificação:** abrir a interface, autenticar e conferir as requisições ao BFF. Em erro de rede/CORS, revisar endereços e origens autorizadas nos dois servidores.

#### Prometheus

- **Arquivo:** [`prometheus/config/prometheus.yml`](prometheus/config/prometheus.yml), montado em `/etc/prometheus/prometheus.yml`.
- **Coleta atual:** `/actuator/prometheus` em `host.docker.internal:8080` e `/metrics` em `host.docker.internal:3000`. Essa configuração depende da resolução de `host.docker.internal` no Docker Desktop.
- **Outro ambiente:** se esse hostname não resolver, configure os targets para `back-end:8080` e `bff:3000`, mantendo os respectivos `metrics_path`, pois estão na mesma rede Docker. Após editar, execute `docker compose restart prometheus`.
- **Verificação:** `http://localhost:9090/targets` deve mostrar os dois jobs como `UP`. Em `DOWN`, confira a URL de coleta e os logs do serviço correspondente.

#### Grafana

- **Acesso:** `http://localhost:3001`, credenciais iniciais demonstrativas `admin/admin`. Em volume existente, vale a senha cadastrada anteriormente.
- **Fonte:** [`grafana/provisioning/datasources/datasources.yaml`](grafana/provisioning/datasources/datasources.yaml) provisiona **Prometheus** em `http://prometheus:9090`.
- **Dashboards:** [`grafana/provisioning/dashboards/dashboards.yaml`](grafana/provisioning/dashboards/dashboards.yaml) aponta para os painéis JVM/Node montados de `grafana/dashboards/`. Mantenha volumes e caminhos alinhados e o Prometheus coletando os jobs.
- **Verificação:** abrir os dashboards provisionados. Em `No data` ou fonte ausente, conferir a fonte Prometheus selecionada no painel, o intervalo de tempo e os targets.

#### Jenkins e agente de build

1. Abra `http://localhost:8085`. Em instalação nova, obtenha a senha de desbloqueio com `docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword`, conclua o assistente e crie seu administrador. Em volume existente, use o usuário/senha já cadastrados; a senha inicial pode não existir mais.
2. Instale os plugins **Pipeline**, **Git**, **Credentials Binding**, **Timestamper** e **SonarQube Scanner for Jenkins**, com suas dependências. Permita acesso de rede ao Git, Maven, npm e downloads das ferramentas.
3. Em **Manage Jenkins → Nodes**, crie um agente permanente chamado **`agente-local`**, diretório remoto **`/home/jenkins/agent`**, label **`docker-local`** e método de lançamento por conexão do agente ao controlador. O `Jenkinsfile` exige esse label.
4. Copie o secret exibido na página de conexão do agente e crie/atualize o `.env` **na raiz do repositório**:

   ```dotenv
   JENKINS_AGENT_SECRET=SUBSTITUA_PELO_SECRET_DO_AGENTE
   ```

   O arquivo está ignorado pelo Git. Esse secret não é a senha do usuário Jenkins; não publique seu valor no README ou Compose.

5. Execute `docker compose up -d --build jenkins jenkins-agent`. O agente usa `http://jenkins:8080/`, WebSocket e `jenkins_agent_home`; não é necessário publicar a porta 50000. Ao trocar o secret, recrie com `docker compose up -d --force-recreate jenkins-agent`.
6. A imagem [`infraestrutura/jenkins-agent/Dockerfile`](infraestrutura/jenkins-agent/Dockerfile) instala Maven, Node 22, npm, Chromium e JDK 27 em `/opt/jdks/jdk-27`. Se alterar a imagem, reconstrua o serviço. A pipeline usa esse JDK e `CHROME_BIN=/usr/bin/chromium` para os testes Angular.
7. Crie um job **Pipeline from SCM**, selecione Git, informe a URL deste repositório, credenciais se ele for privado, a branch desejada e **Script Path `Jenkinsfile`**. Configure SonarQube conforme o próximo item antes de executar todos os estágios.
8. **Verificação:** agente online no Jenkins e `docker compose logs --tail=30 jenkins-agent` mostrando `Connected`. Se ficar aguardando, confira nome, secret, URL e conclusão da inicialização do controlador.

#### SonarQube e Quality Gates

1. Abra `http://localhost:9000` e conclua a configuração inicial. Em instalação nova, o acesso inicial padrão é `admin/admin`; em volume existente, use a credencial já definida.
2. Crie os projetos com as chaves **`back-end`**, **`bff`** e **`front-end`**, correspondentes aos arquivos `sonar-project.properties` de cada pasta. Gere tokens com permissão de análise nos respectivos projetos.
3. No Jenkins, crie credenciais **Secret text** com IDs exatos **`sonar-token-backend`**, **`sonar-token-bff`** e **`sonar-token-frontend`**. Seus valores são os tokens SonarQube, não senhas de login.
4. Em **Manage Jenkins → System → SonarQube servers**, configure a instalação **`sonarqube-local`**, URL **`http://sonarqube:9000`**. O plugin e as credenciais precisam estar acessíveis ao job.
5. Em **Manage Jenkins → Tools**, configure **SonarQube Scanner** com nome **`sonar-scanner`**, instalação automática ou caminho acessível no agente. O `Jenkinsfile` usa esse nome literalmente.
6. No SonarQube, configure webhook para **`http://jenkins:8080/sonarqube-webhook/`**, com a barra final. Os estágios `waitForQualityGate` aguardam até 10 minutos e interrompem a pipeline se o gate falhar.
7. Gere `back-end/target/classes`, `back-end/target/site/jacoco/jacoco.xml` e `coverage/lcov.info` nas pastas BFF/frontend antes do scanner. A pipeline faz isso com os builds/testes; executar o scanner isoladamente sem esses arquivos deixa a análise incompleta.
8. **Verificação:** três análises disponíveis no SonarQube e estágios Quality Gate concluídos no Jenkins. A pipeline atual valida e analisa; não possui estágio de deploy nem atualiza automaticamente os containers da aplicação.

## 🔐 Segurança e autenticação

O projeto utiliza **Spring Security**, autenticação baseada em **JWT**, fluxo de **access/refresh tokens** e uso de **cookies HttpOnly**. O BFF concentra a passagem de credenciais entre o navegador e a API Java; o backend permanece responsável por validar a autenticação e as permissões.

Para o acesso funcionar:

- **Usuário e perfil:** em banco novo, entre com `admin/admin`, criado pelo init. Em banco já utilizado, valem os usuários existentes. Ajuste os perfis pela administração de usuários; financeiro e administração de acessos exigem ADMIN/DEV.
- **RSA do login:** mantenha `PUBLIC_KEY` nos dois arquivos de ambiente Angular e `PRIVATE_KEY` no BFF como um par correspondente, em formato PEM. Ao substituir o par demonstrativo, forneça a chave privada ao BFF pelo ambiente do processo/container e recompile o Angular com a chave pública. Não publique a chave privada.
- **JWT:** configure `JWT_SECRET` no backend e mantenha o mesmo valor entre reinicializações/instâncias que validam os tokens. `jwt.token.validity` e `jwt.refresh-token.validity`, no `application.yaml`, controlam a duração; os padrões são uma hora e oito horas, em milissegundos. Alterar a chave invalida as sessões existentes.
- **Cookies e origens:** o ambiente local HTTP usa `jwt.cookie.secure=false` e `jwt.cookie.same-site=Lax`. O BFF encaminha cookies; o cliente precisa enviar credenciais nas requisições. Para HTTPS, configure `JWT_COOKIE_SECURE=true` no backend. Em domínios distintos, revise também `JWT_COOKIE_SAME_SITE` e o CORS de ambos os servidores para o cenário real.
- **Verificação:** após o login, confira os cookies `access_token` e `refresh_token` no navegador e uma chamada autenticada. Em 401, revise cookies/tokens; em 403, revise o perfil; em bloqueio CORS, confira a origem da interface autorizada no BFF e na API.

A cobertura automatizada inclui cenários de expiração, assinatura inválida, renovação, logout e respostas **401/403**. Para uma implantação real, também devem ser revisadas políticas de cookies, CORS, TLS, gerenciamento de segredos e acesso aos serviços internos.

## ✅ Testes e qualidade

As métricas abaixo são **resultados registrados na documentação do repositório**, e não medições realizadas durante a elaboração deste README.

| Componente | Testes registrados | Cobertura de linhas | Cobertura de branches |
| --- | ---: | ---: | ---: |
| API Spring Boot (13/10/2026) | 397 | 96,08% | 86,84% |
| BFF NestJS (14/10/2026) | 144 | 99,78% | 96,72% |
| Front-end Angular (14/10/2026) | 521 | 97,08% | 92,43% |

A verificação JaCoCo exige **mínimo de 90% de linhas e 80% de branches** no backend. Para BFF e front-end, a documentação define **mínimo de 90%** nas métricas de cobertura utilizadas por suas suítes.

```bash
# API: executar na pasta back-end com JDK 27
mvn clean verify

# BFF: executar na pasta bff
npm ci
npm run test:ci

# Front-end: executar na pasta front-end (Chrome/Chromium requerido)
npm ci
npm run test:ci
```

Os testes automatizados utilizam mecanismos de isolamento e mocks; a suíte, isoladamente, não substitui testes integrados com todos os serviços reais.

### Configuração por ferramenta de qualidade

| Item | Preparação e resultado esperado |
| --- | --- |
| JUnit e JaCoCo | JDK 27 selecionado em `JAVA_HOME`/`PATH`, Maven disponível e acesso às dependências. `mvn clean verify` na pasta `back-end` gera `target/surefire-reports` e `target/site/jacoco`; as integrações de teste usam H2/mocks e não exigem subir os bancos externos. |
| Jest no BFF | Node/npm instalados e `npm ci` em `bff`. `npm run test:ci` gera `coverage/lcov.info` e verifica os limites de cobertura. |
| Karma no Angular | Node/npm, `npm ci` em `front-end` e Chrome/Chromium instalado. No Windows, defina `$env:CHROME_BIN = 'C:\Program Files\Google\Chrome\Application\chrome.exe'` no PowerShell antes de `npm run test:ci`. No agente Linux, a imagem fornece `/usr/bin/chromium` e o launcher `ChromeHeadlessCI`. |
| SonarQube Scanner | Configurar servidor, ferramenta, tokens e webhook conforme SonarQube e Quality Gates acima. O scanner lê os relatórios gerados pelos testes; iniciar apenas o container SonarQube não executa análise. |
| Storybook / design system | Executar `npm ci` em `front-end` e `npm run storybook` para o catálogo local, ou `npm run build-storybook` para gerar a versão estática em `storybook-static`. É separado da interface publicada pelo Compose. |

## 🔄 CI/CD e observabilidade

O repositório contém um [`Jenkinsfile`](Jenkinsfile) e configuração de agente em `infraestrutura/jenkins-agent`, além de integração com **SonarQube** e coleta de métricas por **Prometheus** para visualização no **Grafana**.

Esse conjunto demonstra práticas de **build automatizado, verificação de testes e cobertura, análise estática e acompanhamento operacional**. No contexto do projeto, o **Jenkins** representa a orquestração das etapas de integração contínua dos três blocos principais (**front-end, BFF e back-end**), enquanto o **SonarQube** centraliza a análise de qualidade desses componentes. Na observabilidade, **back-end** e **BFF** disponibilizam métricas para o **Prometheus**, que faz a coleta e o armazenamento das séries temporais. O **Grafana** consulta essas métricas no Prometheus, configurado como sua fonte de dados — sem conexão direta de métricas das aplicações ao Grafana. A execução da pipeline depende da configuração local do Jenkins, credenciais e serviços externos definidos para o ambiente.

## 🖼️ Interface

O front-end explora uma identidade visual **Frutiger Aero**, com foco em uma experiência visual distinta para um sistema de gestão.

> 💡 **Galeria sugerida:** adicione capturas reais em `docs/screenshots/` (login, dashboard, atendimentos, agenda, vendas e financeiro) e substitua esta observação por imagens. Nenhuma captura foi presumida ou criada sem acesso à aplicação em execução.

## 📚 Documentação adicional

- [`FINANCEIRO.md`](FINANCEIRO.md) — módulo financeiro, regras e APIs.
- [`TESTING.md`](TESTING.md) — testes e cobertura do BFF e front-end.
- [`back-end/TESTING.md`](back-end/TESTING.md) — cobertura JaCoCo, testes Java e isolamento.
- [`Jenkinsfile`](Jenkinsfile) — definição da pipeline.

## 👨‍💻 Autor

Desenvolvido por **[Kalleo Leandro](https://github.com/KalleoLeandro)** como um projeto funcional voltado ao estudo e à evolução prática de soluções Full Stack, arquitetura de software, testes automatizados, observabilidade e DevOps.

<div align="center">

---


[⬆ Voltar ao topo](#-sistema-gerencial-full-stack)

</div>
