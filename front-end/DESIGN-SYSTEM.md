# Design system Aero

## Tema claro e escuro

O botão **Claro / Escuro** aparece no login, no cabeçalho principal e no Design
System. A escolha é salva em `localStorage` (`aero-theme`) e sincronizada entre
abas. Sem preferência salva, o tema acompanha o sistema operacional. O arquivo
`public/theme-init.js` aplica a preferência antes da renderização inicial.

`ThemeService` mantém `data-theme` e `data-bs-theme` no elemento `html`, incluindo
os modais e menus anexados ao `body`. Os estilos escuros ficam em `src/aero-dark.css`.
Use `--aero-page-bg`, `--aero-surface`, `--aero-text`, `--aero-muted` e
`--aero-border` em novas superfícies. Preserve as cores semânticas para erros e sucesso.

O item `/design-system/theme` contém um exemplo interativo e a API de importação.
No Storybook, a barra de ferramentas permite alternar **Claro / Escuro** em todas
as histórias. Essa escolha é independente da preferência salva na aplicação.

O catálogo está em `/design-system`, após autenticação, com acesso exclusivo ao
perfil `DEV` e entrada direta pela URL. A verificação de perfil também é refeita
ao navegar entre as páginas dos componentes; os demais perfis são enviados para `/401`.
Ele usa o `DesignSystemLayoutComponent`, fora do `MainLayoutComponent`, com
cabeçalho, rodapé e sidebar próprios. Não aparece no menu lateral do sistema principal.
Cada componente possui uma rota, por exemplo `/design-system/button`,
`/design-system/input` e `/design-system/dialog`. O endereço `/design-system`
redireciona para a página do botão. A sidebar destaca a página ativa e permanece
visível à esquerda, inclusive em telas pequenas, com rolagem própria. O exemplo
e a documentação do componente selecionado aparecem à direita.
Os exemplos são locais e não enviam dados para a API.

O item **Classes CSS** abre `/design-system/classes-css`, com exemplos visuais,
HTML copiável e CSS complementar para divs, superfícies glass, painéis, botões,
campos, grids, seleções, alertas, tabelas e seções expansíveis. A página também
explica como personalizar variáveis CSS locais. Ela herda a restrição ao perfil DEV.

Cada página reúne um **exemplo interativo**, informações de uso e a seção
**Como importar**, com exemplos completos de TypeScript e HTML, botões de cópia,
propriedades, tipos, valores padrão, eventos e métodos públicos. A documentação também
está disponível em **Aero / Como importar** no Storybook. O conteúdo fica em
`src/app/pages/design-system/docs/aero-usage.data.ts` e deve acompanhar mudanças
na API dos componentes.

## Storybook

O mesmo design system também está disponível em um Storybook independente,
sem autenticação e sem backend. Na pasta `front-end`:

```sh
npm install
npm run storybook
```

Abra `http://localhost:6006`. O navegador não é aberto automaticamente.
Use o menu lateral para navegar entre as famílias, **Controls** para variar
propriedades, **Docs** para consultar exemplos e **Accessibility** para
inspecionar acessibilidade. As histórias de botão, campo e diálogo também
incluem verificações de interação executadas ao abrir seus exemplos.

```sh
npm run build-storybook
```

Esse comando gera o site estático em `front-end/storybook-static`, que pode
ser servido por um servidor HTTP. Nenhuma publicação externa é feita.

- Configuração: `.storybook/main.ts`, `preview.ts` e `tsconfig.json`.
- Histórias: `src/app/components/aero/**/*.stories.ts`, junto aos componentes.
- Introdução e catálogo completo: `stories/*.stories.ts`.
- Estilos: os mesmos `src/styles.css` e `src/aero.css` da aplicação.
- Catálogo completo: reutiliza diretamente `DesignSystemComponent`.
- Storybook 9.1.20 e complementos fixados para o ambiente Angular 19 / Node 20.
- `scripts/storybook.cjs` habilita a compatibilidade ESM necessária no Node
  20.18; no Node 20.19 ou superior essa opção já é padrão.

Para adicionar uma variante, exporte um `StoryObj` no arquivo da família.
Use `args` e `argTypes` para propriedades editáveis e preserve as classes
compartilhadas: não copie os estilos para dentro das histórias.
As histórias renderizam os componentes Angular reais, com suas propriedades e
eventos. O catálogo usa os mesmos componentes. A migração das demais telas
continua independente.

Integração baseada na [documentação oficial do Storybook para Angular](https://storybook.js.org/docs/9/get-started/frameworks/angular).

## Base compartilhada

`src/aero.css` contém as classes reutilizáveis de HTML nativo. É importado por
`src/styles.css`, que mantém as cores Aero existentes e define o fundo branco.
As superfícies usam reflexos suaves, bordas azuladas e sombras discretas.
Não é necessário importar módulos Material para utilizar as classes.

| Elemento | Classe |
| --- | --- |
| Botão ou link de ação | `aero-button` |
| Variações de ação | `aero-button--primary`, `--success`, `--danger`, `--quiet` |
| Agrupamento de label, campo e mensagem | `aero-field` |
| Input, select, textarea | `aero-input`, `aero-select`, `aero-textarea` |
| Checkbox, radio e switch | `aero-choice` no agrupamento |
| Card e painel | `aero-card` |
| Indicador de situação | `aero-badge`, `aero-badge--success`, `aero-badge--warning` |
| Mensagem | `aero-alert`, `aero-alert--error` |
| Tabela com rolagem | `aero-table-wrap` e `aero-table` |
| Diálogo nativo | `aero-dialog aero-card` em `dialog` |
| Seção expansível | `aero-details` em `details` |
| Progresso e carregamento | `aero-progress`, `aero-spinner` |

## Componentes Angular

Os 16 componentes standalone ficam em `src/app/components/aero`, cada um em
sua pasta com a história do Storybook. `index.ts` exporta a API pública.

| Componente | Principais propriedades e eventos |
| --- | --- |
| `app-aero-button` | `label`, `variant`, `type`, `disabled`, `loading`, `(pressed)` |
| `app-aero-input` | `label`, `type`, `hint`, `error`, `readonly`, `suggestions` |
| `app-aero-select` | `label`, `options`, `placeholder` |
| `app-aero-textarea` | `label`, `rows`, `maxLength`, `readonly` |
| `app-aero-checkbox` | `label`, `kind` (`checkbox` ou `switch`) |
| `app-aero-radio-group` | `label`, `options` |
| `app-aero-file` | `label`, `accept`, `multiple`, `(filesSelected)` |
| `app-aero-card` | `glass`, conteúdo projetado |
| `app-aero-badge` | `label`, `tone` |
| `app-aero-alert` | `message`, `tone`, `liveRole` |
| `app-aero-progress` | `label`, `value`, `indeterminate` |
| `app-aero-details` | `label`, `[(expanded)]`, conteúdo projetado |
| `app-aero-dialog` | `title`, `description`, `destructive`, `open()`, `close()`, `(confirmed)`, `(cancelled)`, `(closed)` |
| `app-aero-pagination` | `[(page)]`, `totalPages` |
| `app-aero-segmented` | `label`, `options`, `[(value)]` |
| `app-aero-table` | `caption`, `columns`, `rows`, `cellTemplate`, `emptyMessage` |

Importe apenas os componentes usados pela página:

```ts
import { AeroInputComponent, AeroButtonComponent } from '@components/aero';
// No @Component: imports: [ReactiveFormsModule, AeroInputComponent, AeroButtonComponent]
```

## Uso com formulários Angular

```html
<form [formGroup]="form" (ngSubmit)="salvar()">
  <app-aero-input label="Nome" formControlName="nome" required
    hint="Informe o nome completo." error="O nome é obrigatório." />
  <app-aero-button type="submit" variant="primary" label="Salvar" />
</form>
```

Input, select, textarea, checkbox e grupo de rádio implementam `ControlValueAccessor`:
suportam `formControlName`, `[formControl]` e `[(ngModel)]`. Sem um formulário,
também aceitam `[value]` e `(valueChange)`. Labels e mensagens são associados
automaticamente por IDs únicos; `controlId` permite fornecer um ID explícito.
Erros aparecem quando o controle está inválido e tocado, ou com `[invalid]="true"`.
Desabilite campos vinculados usando `control.disable()` e configure validadores
no `FormControl` (por exemplo, `Validators.required`, `Validators.email`).
`required`, `min` e `max` também configuram o elemento nativo, mas não substituem
os validadores do modelo. Preserve/adapte máscaras ao migrar: diretivas aplicadas
no host do componente não são automaticamente transferidas ao input interno.

Campos numéricos retornam `number | null`; datas e horários retornam strings.
Select e rádio usam `AeroOption[]` com valores `string | number`, preservando o
tipo selecionado. Para entidades, use o ID e resolva o objeto na página.
Arquivos emitem `File[]` por `filesSelected`; o componente não realiza upload.
Os botões usam `type="button"` por padrão; configure `submit` ou `reset` quando
necessário. Para avisos dinâmicos, use `liveRole="status"`.

Abra diálogos usando a referência do componente: `dialog.open()`. Internamente,
ele usa `showModal()` para foco modal e fechamento por Escape do navegador.
Confirmação e cancelamento fecham o diálogo e emitem seus eventos distintos.
O tema inclui foco visível, preferência por movimento reduzido e bordas para
modo de cores forçadas.

## Migração das telas de negócio

As 16 telas de cadastro, edição e detalhes (empresas, avulsos, usuários,
produtos, serviços, agenda, equipamentos, atendimentos, manutenção e orçamento)
usam os controles e botões Aero. As listagens e outras áreas ainda possuem
consumidores Material; a dependência e o tema permanecem necessários.

O item `/design-system/native-field` documenta os componentes usados nessa migração:

- `AeroFieldComponent`: rótulo, ajuda e mensagens de validação projetados.
- `AeroNativeControlComponent`: `input[aeroControl]`, `select[aeroControl]` e
  `textarea[aeroControl]`, compatíveis com máscaras e os acessores Angular existentes.
- `AeroNativeButtonComponent`: `button[aeroButton]` e `a[aeroButton]`, preservando
  atributos nativos, links, submit e acionamento dos modais existentes.
- `AeroDateDirective`: `input[aeroDate]` usa o seletor nativo de data/hora e
  mantém valores `Date` locais no formulário, inclusive validação `min`/`max`.
  Aceita a escrita de datas serializadas existentes (ISO sem hora ou formato
  `dd/MM/yyyy HH:mm`) para preservar a exibição após falha ao salvar.

Calendários, horários e menus nativos variam conforme navegador e sistema.
O campo `app-aero-input type="date"` continua retornando texto ISO; use
`aeroDate="date"` quando o formulário trabalhar com `Date`.

## Verificação

```sh
npm test -- --watch=false --browsers=ChromeHeadless --include=src/app/components/aero/**/*.spec.ts --include=src/app/pages/**/cadastrar/*.spec.ts
npm run build
npm run build-storybook
```

Os testes verificam integração com formulários, conversão de valores, estados
desabilitados, validação, reset, ngModel, diálogo e limites da paginação.
