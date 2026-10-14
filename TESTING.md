# Testes do BFF e do frontend

Os dois projetos exigem **90% de statements, branches, functions e lines**. O comando retorna erro se qualquer métrica ficar abaixo desse limite, mesmo que os testes passem.

## Organização das suítes

Cada arquivo `.spec.ts` fica na mesma pasta e usa o mesmo nome-base do arquivo testado: por exemplo, `produto.service.ts` e `produto.service.spec.ts`, ou `produto.controller.ts` e `produto.controller.spec.ts`. Suítes que cobriam várias funcionalidades foram distribuídas entre os arquivos correspondentes, preservando os casos existentes.

Somente fixtures e auxiliares compartilhados ficam em `src/testing` no BFF e `src/app/testing` no frontend, com sufixo `.testing.ts`. Esses auxiliares são excluídos da cobertura e da compilação de produção do BFF.

## Executar

Dentro de `bff`:

```sh
npm ci
npm run lint:tests
npm run test:ci
npm run build
```

Dentro de `front-end`, com Chrome ou Chromium instalado:

```sh
npm ci
npm run test:ci
npm run build
```

No Windows, se o navegador não for encontrado automaticamente:

```powershell
$env:CHROME_BIN = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
npm run test:ci
```

O launcher `ChromeHeadlessCI` permite executar no container Jenkins. O Dockerfile de `infraestrutura/jenkins-agent` instala Chromium e define `CHROME_BIN`; reconstrua a imagem do agente para aplicar essa dependência. A pipeline executa testes e builds de ambos os projetos e arquiva os arquivos LCOV.

## Relatórios e escopo

O comando `npm run lint:tests` no BFF verifica todas as suítes e auxiliares com o ESLint, exigindo zero erros e zero avisos. O `tsconfig.json` inclui os testes e os tipos do Jest para o editor e o ESLint; `tsconfig.build.json` continua excluindo os testes e usa somente os tipos de Node na compilação de produção. A formatação aceita o padrão de fim de linha do arquivo para evitar avisos ao abrir o projeto no Windows.

Cada projeto gera `coverage/lcov.info` e um relatório HTML em `coverage`. O frontend também gera `coverage/coverage-final.json` para diagnóstico por arquivo. Jest configura os limites em `bff/package.json`; Karma configura os limites em `front-end/karma.conf.js`, referenciado explicitamente por `angular.json`.

A cobertura inclui controllers, proxy, autenticação, middleware, erros e métricas do BFF; no frontend inclui páginas, serviços, formulários, componentes do design system, imagens, caixa, vendas, financeiro e composição dos documentos PDF. As páginas e o serviço de PDF não são excluídos da medição.

As exclusões se limitam à inicialização/configuração/rotas declarativas, ambientes, tipos/DTOs do BFF e arquivos de testes, suporte de testes e exemplos Storybook. Todos os arquivos executáveis das funcionalidades do frontend são importados pela suíte.

As requisições usam mocks, `HttpTestingController` ou um servidor Nest em memória com proxy substituído. Os testes não precisam do backend, banco ou containers da aplicação em execução. Os cenários sensíveis a datas usam valores explícitos e relógios controlados.

## Resultado validado em 14/10/2026

| Projeto | Testes aprovados | Statements | Branches | Functions | Lines |
| --- | ---: | ---: | ---: | ---: | ---: |
| BFF | 141 | 99,79% | 96,49% | 99,27% | 99,77% |
| Frontend | 521 | 96,87% | 92,43% | 95,77% | 97,08% |

Ambas as suítes foram executadas com `npm run test:ci`, sem falhas, com a barreira de cobertura ativa.

## Back-end Java

As instruções específicas do Maven e JaCoCo estão em [back-end/TESTING.md](back-end/TESTING.md).
