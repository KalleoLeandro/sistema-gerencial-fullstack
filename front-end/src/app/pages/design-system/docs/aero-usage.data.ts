export interface AeroApiProperty {
  name: string;
  type: string;
  defaultValue: string;
  description: string;
  kind: 'Entrada' | 'Evento' | 'Método';
}

export interface AeroUsageDoc {
  id: string;
  name: string;
  component: string;
  selector: string;
  html: string;
  ts: string;
  properties: AeroApiProperty[];
  notes: string;
}

export const AERO_USAGE_DOCS: AeroUsageDoc[] = [
  {
    id: 'theme', name: 'Tema claro e escuro', component: 'AeroThemeToggleComponent', selector: 'app-aero-theme-toggle',
    notes: 'O botão alterna o tema de toda a aplicação, incluindo o Design System. A preferência fica no navegador, é sincronizada entre abas e segue o sistema operacional até a primeira escolha manual. No Storybook, use o seletor Claro/Escuro da barra de ferramentas. Os seletores nativos de data e opções também recebem color-scheme.',
    html: '<app-aero-theme-toggle />\n<app-aero-card glass>Conteúdo com as cores do tema ativo.</app-aero-card>',
    ts: `import { Component } from '@angular/core';
import { AeroThemeToggleComponent, AeroCardComponent } from '@components/aero';

@Component({
  selector: 'app-exemplo-tema', standalone: true,
  imports: [AeroThemeToggleComponent, AeroCardComponent],
  templateUrl: './exemplo-tema.component.html',
})
export class ExemploTemaComponent {}`,
    properties: [
      { name: 'ThemeService.toggle()', type: 'void', defaultValue: '—', kind: 'Método', description: 'Alterna entre light e dark e salva a preferência.' },
      { name: 'ThemeService.setTheme(theme)', type: "'light' | 'dark'", defaultValue: 'preferência salva ou sistema', kind: 'Método', description: 'Define o tema explicitamente. Importe ThemeService de @services/theme.service e obtenha-o com inject.' },
      { name: 'ThemeService.theme()', type: "'light' | 'dark'", defaultValue: 'preferência salva ou sistema', kind: 'Método', description: 'Consulta o tema atual por signal.' },
      { name: 'data-theme / data-bs-theme', type: "'light' | 'dark'", defaultValue: 'light', kind: 'Entrada', description: 'Atributos mantidos automaticamente no html. Incluem os overlays e modais fora do layout.' },
      { name: '--aero-page-bg / --aero-surface / --aero-text / --aero-muted / --aero-border', type: 'variáveis CSS', defaultValue: 'cores do tema', kind: 'Entrada', description: 'Use estas variáveis em novos componentes para herdar as cores. Evite fundos e textos fixos em branco ou preto.' },
    ],
  },
  {
    id: 'native-field',
    name: 'Campos nativos e máscaras',
    component: 'AeroFieldComponent',
    selector: 'app-aero-field / input[aeroControl] / button[aeroButton]',
    notes: 'Use estes componentes quando precisar manter atributos nativos, máscaras ou currencyMask diretamente no controle. O campo associa o rótulo e as mensagens ao input e exibe erros após touched. aeroDate usa o seletor do navegador e entrega Date local, preservando os formulários de cadastro. Para datas como texto ISO, use app-aero-input type="date".',
    html: `<form [formGroup]="form">
  <app-aero-field>
    <span aeroLabel>CPF</span>
    <input aeroControl formControlName="cpf" mask="000.000.000-00">
    <span aeroError>Informe um CPF completo.</span>
  </app-aero-field>
  <app-aero-field>
    <span aeroLabel>Valor</span>
    <input aeroControl currencyMask formControlName="valor"
      [options]="{prefix: 'R$', thousands: '.', decimal: ','}">
  </app-aero-field>
  <app-aero-field>
    <span aeroLabel>Data</span>
    <input aeroControl aeroDate="date" formControlName="data" [min]="hoje">
    <span aeroError>Selecione uma data a partir de hoje.</span>
  </app-aero-field>
  <button aeroButton="primary" type="button" (click)="form.markAllAsTouched()">Validar</button>
</form>`,
    ts: `import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { AeroFieldComponent, AeroNativeControlComponent, AeroNativeButtonComponent, AeroDateDirective } from '@components/aero';

@Component({
  selector: 'app-exemplo-campos-nativos',
  standalone: true,
  imports: [ReactiveFormsModule, AeroFieldComponent, AeroNativeControlComponent,
    AeroNativeButtonComponent, AeroDateDirective, NgxMaskDirective, CurrencyMaskModule],
  providers: [provideNgxMask()],
  templateUrl: './exemplo-campos-nativos.component.html',
})
export class ExemploCamposNativosComponent {
  hoje = new Date();
  form = new FormGroup({
    cpf: new FormControl('', Validators.required),
    valor: new FormControl(0),
    data: new FormControl<Date | null>(null, Validators.required),
  });
}`,
    properties: [
      { name: 'aeroControl', type: 'atributo', defaultValue: '—', kind: 'Entrada', description: 'Aplica o componente Aero a input, textarea e select. Mantém formControlName, ngModel, readonly, placeholder, maxlength e eventos nativos.' },
      { name: 'id', type: 'string', defaultValue: 'gerado automaticamente', kind: 'Entrada', description: 'Identificador do controle, associado ao rótulo do app-aero-field.' },
      { name: 'aeroLabel / aeroHint / aeroError', type: 'conteúdo projetado', defaultValue: '—', kind: 'Entrada', description: 'Rótulo, ajuda e erro. Use condições nos erros quando houver mais de uma validação.' },
      { name: 'aeroDate', type: "'date' | 'time'", defaultValue: "'date'", kind: 'Entrada', description: 'Adapta o input nativo para FormControl<Date | null>. Campo vazio entrega null.' },
      { name: 'min / max', type: 'Date | string | null', defaultValue: 'null', kind: 'Entrada', description: 'Limites de aeroDate. Atualizam o seletor nativo e a validação Angular (aeroMin / aeroMax).' },
      { name: 'aeroButton', type: "'' | 'primary' | 'secondary' | 'success' | 'danger' | 'quiet'", defaultValue: "''", kind: 'Entrada', description: 'Componente sobre button ou a. Preserva submit, routerLink, disabled, click e atributos de modal no próprio elemento.' },
      { name: 'mask / currencyMask', type: 'diretivas externas', defaultValue: '—', kind: 'Entrada', description: 'Importe NgxMaskDirective/provideNgxMask ou CurrencyMaskModule. Use somente uma máscara por input; não combine com aeroDate.' },
    ],
  },
  {
    "id": "button",
    "name": "Botão",
    "component": "AeroButtonComponent",
    "selector": "app-aero-button",
    "html": "<app-aero-button\n  label=\"Salvar\" variant=\"primary\" [loading]=\"saving\"\n  (pressed)=\"save()\" />\n<p>{{ message }}</p>",
    "properties": [
      {
        "name": "label",
        "type": "string",
        "defaultValue": "''",
        "description": "Texto do botão.",
        "kind": "Entrada"
      },
      {
        "name": "accessibleLabel",
        "type": "string",
        "defaultValue": "''",
        "description": "Nome acessível; útil para botões apenas com ícone.",
        "kind": "Entrada"
      },
      {
        "name": "variant",
        "type": "'primary' | 'secondary' | 'success' | 'danger' | 'quiet'",
        "defaultValue": "'secondary'",
        "description": "Estilo visual.",
        "kind": "Entrada"
      },
      {
        "name": "type",
        "type": "'button' | 'submit' | 'reset'",
        "defaultValue": "'button'",
        "description": "Comportamento em formulários.",
        "kind": "Entrada"
      },
      {
        "name": "disabled",
        "type": "boolean",
        "defaultValue": "false",
        "description": "Desabilita a ação.",
        "kind": "Entrada"
      },
      {
        "name": "loading",
        "type": "boolean",
        "defaultValue": "false",
        "description": "Exibe indicador de carregamento e desabilita a ação.",
        "kind": "Entrada"
      },
      {
        "name": "pressed",
        "type": "MouseEvent",
        "defaultValue": "—",
        "description": "Clique no botão habilitado.",
        "kind": "Evento"
      }
    ],
    "notes": "Também aceita conteúdo projetado entre as tags.",
    "ts": "import { Component } from '@angular/core';\nimport { AeroButtonComponent } from '@components/aero';\n\n@Component({\n  selector: 'app-exemplo',\n  standalone: true,\n  imports: [AeroButtonComponent],\n  templateUrl: './exemplo.component.html',\n})\nexport class ExemploComponent {\n  saving = false;\n  message = '';\n\n  save(): void {\n    this.message = 'Ação recebida.';\n  }\n}\n"
  },
  {
    "id": "input",
    "name": "Campo de entrada",
    "component": "AeroInputComponent",
    "selector": "app-aero-input",
    "html": "<app-aero-input label=\"Nome\" [formControl]=\"name\" required\n  placeholder=\"Nome do cliente\" error=\"Informe o nome.\" />",
    "properties": [
      {
        "name": "controlId",
        "type": "string",
        "defaultValue": "ID gerado",
        "description": "Identificador do campo e de seu rótulo.",
        "kind": "Entrada"
      },
      {
        "name": "label",
        "type": "string",
        "defaultValue": "''",
        "description": "Rótulo visível.",
        "kind": "Entrada"
      },
      {
        "name": "hint",
        "type": "string",
        "defaultValue": "''",
        "description": "Texto de ajuda.",
        "kind": "Entrada"
      },
      {
        "name": "error",
        "type": "string",
        "defaultValue": "'Confira o valor informado.'",
        "description": "Mensagem exibida quando há erro.",
        "kind": "Entrada"
      },
      {
        "name": "value",
        "type": "string | number | null",
        "defaultValue": "null",
        "description": "Valor sem formulário; aceita [(value)] com valueChange.",
        "kind": "Entrada"
      },
      {
        "name": "disabled",
        "type": "boolean",
        "defaultValue": "false",
        "description": "Desabilita o campo. Em Reactive Forms, prefira control.disable().",
        "kind": "Entrada"
      },
      {
        "name": "required",
        "type": "boolean",
        "defaultValue": "false",
        "description": "Marca o elemento nativo como obrigatório; configure também Validators.required no modelo.",
        "kind": "Entrada"
      },
      {
        "name": "invalid",
        "type": "boolean",
        "defaultValue": "false",
        "description": "Força a exibição de erro. O estado inválido e tocado do FormControl também é observado.",
        "kind": "Entrada"
      },
      {
        "name": "valueChange",
        "type": "string | number | null",
        "defaultValue": "—",
        "description": "Novo valor após interação do usuário.",
        "kind": "Evento"
      },
      {
        "name": "type",
        "type": "'text' | 'email' | 'password' | 'search' | 'number' | 'date' | 'time' | 'datetime-local' | 'tel' | 'url' | 'range'",
        "defaultValue": "'text'",
        "description": "Tipo do input nativo.",
        "kind": "Entrada"
      },
      {
        "name": "placeholder",
        "type": "string",
        "defaultValue": "''",
        "description": "Texto de exemplo quando o campo está vazio.",
        "kind": "Entrada"
      },
      {
        "name": "autocomplete",
        "type": "string",
        "defaultValue": "'off'",
        "description": "Autopreenchimento do navegador.",
        "kind": "Entrada"
      },
      {
        "name": "min",
        "type": "string | number | null",
        "defaultValue": "null",
        "description": "Limite mínimo nativo.",
        "kind": "Entrada"
      },
      {
        "name": "max",
        "type": "string | number | null",
        "defaultValue": "null",
        "description": "Limite máximo nativo.",
        "kind": "Entrada"
      },
      {
        "name": "step",
        "type": "string | number | null",
        "defaultValue": "null",
        "description": "Intervalo entre valores.",
        "kind": "Entrada"
      },
      {
        "name": "suggestions",
        "type": "string[]",
        "defaultValue": "[]",
        "description": "Sugestões exibidas em datalist nativo.",
        "kind": "Entrada"
      },
      {
        "name": "readonly",
        "type": "boolean",
        "defaultValue": "false",
        "description": "Permite leitura e foco, sem edição.",
        "kind": "Entrada"
      }
    ],
    "notes": "Importe ReactiveFormsModule e configure os validadores no FormControl. Também aceita ngModel com FormsModule. Não combine value e formControl no mesmo campo. Números retornam number ou null; datas e horários retornam strings. Popups variam conforme o navegador.",
    "ts": "import { Component } from '@angular/core';\nimport { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';\nimport { AeroInputComponent } from '@components/aero';\n\n@Component({\n  selector: 'app-exemplo',\n  standalone: true,\n  imports: [ReactiveFormsModule, AeroInputComponent],\n  templateUrl: './exemplo.component.html',\n})\nexport class ExemploComponent {\n  name = new FormControl('', { nonNullable: true, validators: Validators.required });\n}\n"
  },
  {
    "id": "select",
    "name": "Seleção",
    "component": "AeroSelectComponent",
    "selector": "app-aero-select",
    "html": "<app-aero-select label=\"Categoria\" [formControl]=\"category\"\n  [options]=\"options\" placeholder=\"Selecione a categoria\" />",
    "properties": [
      {
        "name": "controlId",
        "type": "string",
        "defaultValue": "ID gerado",
        "description": "Identificador do campo e de seu rótulo.",
        "kind": "Entrada"
      },
      {
        "name": "label",
        "type": "string",
        "defaultValue": "''",
        "description": "Rótulo visível.",
        "kind": "Entrada"
      },
      {
        "name": "hint",
        "type": "string",
        "defaultValue": "''",
        "description": "Texto de ajuda.",
        "kind": "Entrada"
      },
      {
        "name": "error",
        "type": "string",
        "defaultValue": "'Confira o valor informado.'",
        "description": "Mensagem exibida quando há erro.",
        "kind": "Entrada"
      },
      {
        "name": "value",
        "type": "string | number | null",
        "defaultValue": "null",
        "description": "Valor sem formulário; aceita [(value)] com valueChange.",
        "kind": "Entrada"
      },
      {
        "name": "disabled",
        "type": "boolean",
        "defaultValue": "false",
        "description": "Desabilita o campo. Em Reactive Forms, prefira control.disable().",
        "kind": "Entrada"
      },
      {
        "name": "required",
        "type": "boolean",
        "defaultValue": "false",
        "description": "Marca o elemento nativo como obrigatório; configure também Validators.required no modelo.",
        "kind": "Entrada"
      },
      {
        "name": "invalid",
        "type": "boolean",
        "defaultValue": "false",
        "description": "Força a exibição de erro. O estado inválido e tocado do FormControl também é observado.",
        "kind": "Entrada"
      },
      {
        "name": "valueChange",
        "type": "string | number | null",
        "defaultValue": "—",
        "description": "Novo valor após interação do usuário.",
        "kind": "Evento"
      },
      {
        "name": "options",
        "type": "AeroOption[]",
        "defaultValue": "[]",
        "description": "Opções: { label: string; value: string | number; disabled?: boolean }.",
        "kind": "Entrada"
      },
      {
        "name": "placeholder",
        "type": "string",
        "defaultValue": "'Selecione'",
        "description": "Texto da opção vazia, cujo valor é null.",
        "kind": "Entrada"
      }
    ],
    "notes": "Importe ReactiveFormsModule e configure os validadores no FormControl. Também aceita ngModel com FormsModule. Não combine value e formControl no mesmo campo. Os valores preservam o tipo string ou number. Para entidades, use o ID como valor.",
    "ts": "import { Component } from '@angular/core';\nimport { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';\nimport { AeroSelectComponent, AeroOption } from '@components/aero';\n\n@Component({\n  selector: 'app-exemplo',\n  standalone: true,\n  imports: [ReactiveFormsModule, AeroSelectComponent],\n  templateUrl: './exemplo.component.html',\n})\nexport class ExemploComponent {\n  category = new FormControl<string | number | null>(1);\n  options: AeroOption[] = [\n    { label: 'Equipamentos', value: 1 },\n    { label: 'Serviços', value: 2 },\n  ];\n}\n"
  },
  {
    "id": "textarea",
    "name": "Área de texto",
    "component": "AeroTextareaComponent",
    "selector": "app-aero-textarea",
    "html": "<app-aero-textarea label=\"Observações\" [formControl]=\"notes\"\n  [rows]=\"5\" [maxLength]=\"500\" placeholder=\"Descreva os detalhes\" />",
    "properties": [
      {
        "name": "controlId",
        "type": "string",
        "defaultValue": "ID gerado",
        "description": "Identificador do campo e de seu rótulo.",
        "kind": "Entrada"
      },
      {
        "name": "label",
        "type": "string",
        "defaultValue": "''",
        "description": "Rótulo visível.",
        "kind": "Entrada"
      },
      {
        "name": "hint",
        "type": "string",
        "defaultValue": "''",
        "description": "Texto de ajuda.",
        "kind": "Entrada"
      },
      {
        "name": "error",
        "type": "string",
        "defaultValue": "'Confira o valor informado.'",
        "description": "Mensagem exibida quando há erro.",
        "kind": "Entrada"
      },
      {
        "name": "value",
        "type": "string | null",
        "defaultValue": "null",
        "description": "Valor sem formulário; aceita [(value)] com valueChange.",
        "kind": "Entrada"
      },
      {
        "name": "disabled",
        "type": "boolean",
        "defaultValue": "false",
        "description": "Desabilita o campo. Em Reactive Forms, prefira control.disable().",
        "kind": "Entrada"
      },
      {
        "name": "required",
        "type": "boolean",
        "defaultValue": "false",
        "description": "Marca o elemento nativo como obrigatório; configure também Validators.required no modelo.",
        "kind": "Entrada"
      },
      {
        "name": "invalid",
        "type": "boolean",
        "defaultValue": "false",
        "description": "Força a exibição de erro. O estado inválido e tocado do FormControl também é observado.",
        "kind": "Entrada"
      },
      {
        "name": "valueChange",
        "type": "string | null",
        "defaultValue": "—",
        "description": "Novo valor após interação do usuário.",
        "kind": "Evento"
      },
      {
        "name": "placeholder",
        "type": "string",
        "defaultValue": "''",
        "description": "Texto de exemplo quando o campo está vazio.",
        "kind": "Entrada"
      },
      {
        "name": "rows",
        "type": "number",
        "defaultValue": "4",
        "description": "Quantidade inicial de linhas.",
        "kind": "Entrada"
      },
      {
        "name": "maxLength",
        "type": "number | null",
        "defaultValue": "null",
        "description": "Máximo de caracteres no elemento nativo.",
        "kind": "Entrada"
      },
      {
        "name": "readonly",
        "type": "boolean",
        "defaultValue": "false",
        "description": "Permite leitura e foco, sem edição.",
        "kind": "Entrada"
      }
    ],
    "notes": "Importe ReactiveFormsModule e configure os validadores no FormControl. Também aceita ngModel com FormsModule. Não combine value e formControl no mesmo campo.",
    "ts": "import { Component } from '@angular/core';\nimport { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';\nimport { AeroTextareaComponent } from '@components/aero';\n\n@Component({\n  selector: 'app-exemplo',\n  standalone: true,\n  imports: [ReactiveFormsModule, AeroTextareaComponent],\n  templateUrl: './exemplo.component.html',\n})\nexport class ExemploComponent {\n  notes = new FormControl('', { nonNullable: true });\n}\n"
  },
  {
    "id": "checkbox",
    "name": "Checkbox e switch",
    "component": "AeroCheckboxComponent",
    "selector": "app-aero-checkbox",
    "html": "<app-aero-checkbox label=\"Receber notificações\"\n  [formControl]=\"notify\" kind=\"switch\" />",
    "properties": [
      {
        "name": "controlId",
        "type": "string",
        "defaultValue": "ID gerado",
        "description": "Identificador do campo e de seu rótulo.",
        "kind": "Entrada"
      },
      {
        "name": "label",
        "type": "string",
        "defaultValue": "''",
        "description": "Rótulo visível.",
        "kind": "Entrada"
      },
      {
        "name": "hint",
        "type": "string",
        "defaultValue": "''",
        "description": "Texto de ajuda.",
        "kind": "Entrada"
      },
      {
        "name": "error",
        "type": "string",
        "defaultValue": "'Confira o valor informado.'",
        "description": "Mensagem exibida quando há erro.",
        "kind": "Entrada"
      },
      {
        "name": "value",
        "type": "boolean | null",
        "defaultValue": "null",
        "description": "Valor sem formulário; aceita [(value)] com valueChange.",
        "kind": "Entrada"
      },
      {
        "name": "disabled",
        "type": "boolean",
        "defaultValue": "false",
        "description": "Desabilita o campo. Em Reactive Forms, prefira control.disable().",
        "kind": "Entrada"
      },
      {
        "name": "required",
        "type": "boolean",
        "defaultValue": "false",
        "description": "Marca o elemento nativo como obrigatório; configure também Validators.required no modelo.",
        "kind": "Entrada"
      },
      {
        "name": "invalid",
        "type": "boolean",
        "defaultValue": "false",
        "description": "Força a exibição de erro. O estado inválido e tocado do FormControl também é observado.",
        "kind": "Entrada"
      },
      {
        "name": "valueChange",
        "type": "boolean | null",
        "defaultValue": "—",
        "description": "Novo valor após interação do usuário.",
        "kind": "Evento"
      },
      {
        "name": "kind",
        "type": "'checkbox' | 'switch'",
        "defaultValue": "'checkbox'",
        "description": "Semântica do controle.",
        "kind": "Entrada"
      }
    ],
    "notes": "Importe ReactiveFormsModule e configure os validadores no FormControl. Também aceita ngModel com FormsModule. Não combine value e formControl no mesmo campo. Para exigir uma seleção marcada, use Validators.requiredTrue.",
    "ts": "import { Component } from '@angular/core';\nimport { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';\nimport { AeroCheckboxComponent } from '@components/aero';\n\n@Component({\n  selector: 'app-exemplo',\n  standalone: true,\n  imports: [ReactiveFormsModule, AeroCheckboxComponent],\n  templateUrl: './exemplo.component.html',\n})\nexport class ExemploComponent {\n  notify = new FormControl(false, { nonNullable: true });\n}\n"
  },
  {
    "id": "radio",
    "name": "Grupo de rádio",
    "component": "AeroRadioGroupComponent",
    "selector": "app-aero-radio-group",
    "html": "<app-aero-radio-group label=\"Atendimento\"\n  [formControl]=\"service\" [options]=\"options\" />",
    "properties": [
      {
        "name": "controlId",
        "type": "string",
        "defaultValue": "ID gerado",
        "description": "Identificador do campo e de seu rótulo.",
        "kind": "Entrada"
      },
      {
        "name": "label",
        "type": "string",
        "defaultValue": "''",
        "description": "Rótulo visível.",
        "kind": "Entrada"
      },
      {
        "name": "hint",
        "type": "string",
        "defaultValue": "''",
        "description": "Texto de ajuda.",
        "kind": "Entrada"
      },
      {
        "name": "error",
        "type": "string",
        "defaultValue": "'Confira o valor informado.'",
        "description": "Mensagem exibida quando há erro.",
        "kind": "Entrada"
      },
      {
        "name": "value",
        "type": "string | number | null",
        "defaultValue": "null",
        "description": "Valor sem formulário; aceita [(value)] com valueChange.",
        "kind": "Entrada"
      },
      {
        "name": "disabled",
        "type": "boolean",
        "defaultValue": "false",
        "description": "Desabilita o campo. Em Reactive Forms, prefira control.disable().",
        "kind": "Entrada"
      },
      {
        "name": "required",
        "type": "boolean",
        "defaultValue": "false",
        "description": "Marca o elemento nativo como obrigatório; configure também Validators.required no modelo.",
        "kind": "Entrada"
      },
      {
        "name": "invalid",
        "type": "boolean",
        "defaultValue": "false",
        "description": "Força a exibição de erro. O estado inválido e tocado do FormControl também é observado.",
        "kind": "Entrada"
      },
      {
        "name": "valueChange",
        "type": "string | number | null",
        "defaultValue": "—",
        "description": "Novo valor após interação do usuário.",
        "kind": "Evento"
      },
      {
        "name": "options",
        "type": "AeroOption[]",
        "defaultValue": "[]",
        "description": "Opções: { label: string; value: string | number; disabled?: boolean }.",
        "kind": "Entrada"
      }
    ],
    "notes": "Importe ReactiveFormsModule e configure os validadores no FormControl. Também aceita ngModel com FormsModule. Não combine value e formControl no mesmo campo.",
    "ts": "import { Component } from '@angular/core';\nimport { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';\nimport { AeroRadioGroupComponent, AeroOption } from '@components/aero';\n\n@Component({\n  selector: 'app-exemplo',\n  standalone: true,\n  imports: [ReactiveFormsModule, AeroRadioGroupComponent],\n  templateUrl: './exemplo.component.html',\n})\nexport class ExemploComponent {\n  service = new FormControl<string | number | null>('local');\n  options: AeroOption[] = [\n    { label: 'Presencial', value: 'local' },\n    { label: 'Remoto', value: 'remote' },\n  ];\n}\n"
  },
  {
    "id": "file",
    "name": "Arquivo",
    "component": "AeroFileComponent",
    "selector": "app-aero-file",
    "html": "<app-aero-file label=\"Imagens\" accept=\"image/*\" multiple\n  (filesSelected)=\"onFiles($event)\" />\n<p>{{ files.length }} arquivo(s) selecionado(s).</p>",
    "properties": [
      {
        "name": "controlId",
        "type": "string",
        "defaultValue": "ID gerado",
        "description": "Identificador do input e do rótulo.",
        "kind": "Entrada"
      },
      {
        "name": "label",
        "type": "string",
        "defaultValue": "'Anexo'",
        "description": "Rótulo visível.",
        "kind": "Entrada"
      },
      {
        "name": "hint",
        "type": "string",
        "defaultValue": "''",
        "description": "Texto de ajuda.",
        "kind": "Entrada"
      },
      {
        "name": "accept",
        "type": "string",
        "defaultValue": "''",
        "description": "Tipos sugeridos pelo seletor, por exemplo image/* ou .pdf.",
        "kind": "Entrada"
      },
      {
        "name": "multiple",
        "type": "boolean",
        "defaultValue": "false",
        "description": "Permite selecionar mais de um arquivo.",
        "kind": "Entrada"
      },
      {
        "name": "disabled",
        "type": "boolean",
        "defaultValue": "false",
        "description": "Desabilita a seleção.",
        "kind": "Entrada"
      },
      {
        "name": "filesSelected",
        "type": "File[]",
        "defaultValue": "—",
        "description": "Arquivos escolhidos pelo usuário.",
        "kind": "Evento"
      }
    ],
    "notes": "Não realiza upload e não implementa ControlValueAccessor. O tratamento dos arquivos pertence à página.",
    "ts": "import { Component } from '@angular/core';\nimport { AeroFileComponent } from '@components/aero';\n\n@Component({\n  selector: 'app-exemplo',\n  standalone: true,\n  imports: [AeroFileComponent],\n  templateUrl: './exemplo.component.html',\n})\nexport class ExemploComponent {\n  files: File[] = [];\n\n  onFiles(files: File[]): void {\n    this.files = files;\n  }\n}\n"
  },
  {
    "id": "card",
    "name": "Card",
    "component": "AeroCardComponent",
    "selector": "app-aero-card",
    "html": "<app-aero-card [glass]=\"true\">\n  <h2>Ordem de serviço</h2>\n  <p>Conteúdo do card.</p>\n</app-aero-card>",
    "properties": [
      {
        "name": "glass",
        "type": "boolean",
        "defaultValue": "false",
        "description": "Aplica o acabamento glass.",
        "kind": "Entrada"
      }
    ],
    "notes": "Aceita qualquer conteúdo projetado entre as tags.",
    "ts": "import { Component } from '@angular/core';\nimport { AeroCardComponent } from '@components/aero';\n\n@Component({\n  selector: 'app-exemplo',\n  standalone: true,\n  imports: [AeroCardComponent],\n  templateUrl: './exemplo.component.html',\n})\nexport class ExemploComponent {}\n"
  },
  {
    "id": "badge",
    "name": "Indicador de situação",
    "component": "AeroBadgeComponent",
    "selector": "app-aero-badge",
    "html": "<app-aero-badge label=\"Concluído\" tone=\"success\" />",
    "properties": [
      {
        "name": "label",
        "type": "string",
        "defaultValue": "''",
        "description": "Texto do indicador.",
        "kind": "Entrada"
      },
      {
        "name": "tone",
        "type": "'info' | 'success' | 'warning'",
        "defaultValue": "'info'",
        "description": "Cor semântica.",
        "kind": "Entrada"
      }
    ],
    "notes": "Também aceita conteúdo projetado entre as tags.",
    "ts": "import { Component } from '@angular/core';\nimport { AeroBadgeComponent } from '@components/aero';\n\n@Component({\n  selector: 'app-exemplo',\n  standalone: true,\n  imports: [AeroBadgeComponent],\n  templateUrl: './exemplo.component.html',\n})\nexport class ExemploComponent {}\n"
  },
  {
    "id": "alert",
    "name": "Alerta",
    "component": "AeroAlertComponent",
    "selector": "app-aero-alert",
    "html": "<app-aero-alert message=\"Alterações salvas.\"\n  tone=\"info\" liveRole=\"status\" />",
    "properties": [
      {
        "name": "message",
        "type": "string",
        "defaultValue": "''",
        "description": "Mensagem exibida.",
        "kind": "Entrada"
      },
      {
        "name": "tone",
        "type": "'info' | 'error'",
        "defaultValue": "'info'",
        "description": "Aparência da mensagem.",
        "kind": "Entrada"
      },
      {
        "name": "liveRole",
        "type": "'status' | 'alert' | null",
        "defaultValue": "null",
        "description": "Anúncio de mensagens dinâmicas para tecnologias assistivas.",
        "kind": "Entrada"
      }
    ],
    "notes": "Use liveRole para mensagens atualizadas dinamicamente. Aceita conteúdo projetado.",
    "ts": "import { Component } from '@angular/core';\nimport { AeroAlertComponent } from '@components/aero';\n\n@Component({\n  selector: 'app-exemplo',\n  standalone: true,\n  imports: [AeroAlertComponent],\n  templateUrl: './exemplo.component.html',\n})\nexport class ExemploComponent {}\n"
  },
  {
    "id": "progress",
    "name": "Progresso",
    "component": "AeroProgressComponent",
    "selector": "app-aero-progress",
    "html": "<app-aero-progress label=\"Carregamento\" [value]=\"65\" />",
    "properties": [
      {
        "name": "label",
        "type": "string",
        "defaultValue": "'Carregamento'",
        "description": "Rótulo do progresso.",
        "kind": "Entrada"
      },
      {
        "name": "value",
        "type": "number",
        "defaultValue": "0",
        "description": "Percentual limitado entre 0 e 100.",
        "kind": "Entrada"
      },
      {
        "name": "indeterminate",
        "type": "boolean",
        "defaultValue": "false",
        "description": "Exibe progresso sem percentual conhecido.",
        "kind": "Entrada"
      }
    ],
    "notes": "O componente gera automaticamente um ID para associar o rótulo à barra.",
    "ts": "import { Component } from '@angular/core';\nimport { AeroProgressComponent } from '@components/aero';\n\n@Component({\n  selector: 'app-exemplo',\n  standalone: true,\n  imports: [AeroProgressComponent],\n  templateUrl: './exemplo.component.html',\n})\nexport class ExemploComponent {}\n"
  },
  {
    "id": "details",
    "name": "Seção expansível",
    "component": "AeroDetailsComponent",
    "selector": "app-aero-details",
    "html": "<app-aero-details label=\"Detalhes adicionais\" [(expanded)]=\"expanded\">\n  <p>Informações complementares.</p>\n</app-aero-details>",
    "properties": [
      {
        "name": "label",
        "type": "string",
        "defaultValue": "'Detalhes'",
        "description": "Título clicável.",
        "kind": "Entrada"
      },
      {
        "name": "expanded",
        "type": "boolean",
        "defaultValue": "false",
        "description": "Estado aberto; aceita [(expanded)].",
        "kind": "Entrada"
      },
      {
        "name": "expandedChange",
        "type": "boolean",
        "defaultValue": "—",
        "description": "Novo estado após a alternância.",
        "kind": "Evento"
      }
    ],
    "notes": "O corpo da seção é inserido entre as tags.",
    "ts": "import { Component } from '@angular/core';\nimport { AeroDetailsComponent } from '@components/aero';\n\n@Component({\n  selector: 'app-exemplo',\n  standalone: true,\n  imports: [AeroDetailsComponent],\n  templateUrl: './exemplo.component.html',\n})\nexport class ExemploComponent {\n  expanded = false;\n}\n"
  },
  {
    "id": "dialog",
    "name": "Diálogo",
    "component": "AeroDialogComponent",
    "selector": "app-aero-dialog",
    "html": "<app-aero-button label=\"Excluir\" (pressed)=\"dialog.open()\" />\n<app-aero-dialog #dialog title=\"Excluir registro\"\n  description=\"Deseja continuar?\" destructive\n  confirmLabel=\"Excluir\" (confirmed)=\"confirm()\" />\n<p>{{ message }}</p>",
    "properties": [
      {
        "name": "title",
        "type": "string",
        "defaultValue": "'Confirmar ação'",
        "description": "Título acessível do diálogo.",
        "kind": "Entrada"
      },
      {
        "name": "description",
        "type": "string",
        "defaultValue": "''",
        "description": "Descrição abaixo do título.",
        "kind": "Entrada"
      },
      {
        "name": "cancelLabel",
        "type": "string",
        "defaultValue": "'Cancelar'",
        "description": "Texto do cancelamento.",
        "kind": "Entrada"
      },
      {
        "name": "confirmLabel",
        "type": "string",
        "defaultValue": "'Confirmar'",
        "description": "Texto da confirmação.",
        "kind": "Entrada"
      },
      {
        "name": "destructive",
        "type": "boolean",
        "defaultValue": "false",
        "description": "Usa estilo de perigo na confirmação.",
        "kind": "Entrada"
      },
      {
        "name": "confirmed",
        "type": "void",
        "defaultValue": "—",
        "description": "Confirmação; o diálogo fecha.",
        "kind": "Evento"
      },
      {
        "name": "cancelled",
        "type": "void",
        "defaultValue": "—",
        "description": "Cancelamento pelo botão ou Escape.",
        "kind": "Evento"
      },
      {
        "name": "closed",
        "type": "string",
        "defaultValue": "—",
        "description": "Resultado ao fechar: 'confirm', 'cancel' ou valor passado a close().",
        "kind": "Evento"
      },
      {
        "name": "open()",
        "type": "void",
        "defaultValue": "—",
        "description": "Abre o diálogo modal.",
        "kind": "Método"
      },
      {
        "name": "close(result?: string)",
        "type": "void",
        "defaultValue": "result = ''",
        "description": "Fecha o diálogo com resultado opcional.",
        "kind": "Método"
      }
    ],
    "notes": "Acesse os métodos por referência de template (#dialog). Também aceita conteúdo projetado; o navegador gerencia foco modal e Escape.",
    "ts": "import { Component } from '@angular/core';\nimport { AeroDialogComponent, AeroButtonComponent } from '@components/aero';\n\n@Component({\n  selector: 'app-exemplo',\n  standalone: true,\n  imports: [AeroDialogComponent, AeroButtonComponent],\n  templateUrl: './exemplo.component.html',\n})\nexport class ExemploComponent {\n  message = '';\n\n  confirm(): void {\n    this.message = 'Confirmação recebida.';\n  }\n}\n"
  },
  {
    "id": "pagination",
    "name": "Paginação",
    "component": "AeroPaginationComponent",
    "selector": "app-aero-pagination",
    "html": "<app-aero-pagination [(page)]=\"page\" [totalPages]=\"5\" />",
    "properties": [
      {
        "name": "label",
        "type": "string",
        "defaultValue": "'Paginação'",
        "description": "Nome acessível da navegação.",
        "kind": "Entrada"
      },
      {
        "name": "page",
        "type": "number",
        "defaultValue": "1",
        "description": "Página atual; aceita [(page)].",
        "kind": "Entrada"
      },
      {
        "name": "totalPages",
        "type": "number",
        "defaultValue": "1",
        "description": "Quantidade de páginas; mínimo efetivo 1.",
        "kind": "Entrada"
      },
      {
        "name": "pageChange",
        "type": "number",
        "defaultValue": "—",
        "description": "Página solicitada. Use o evento para carregar os dados.",
        "kind": "Evento"
      }
    ],
    "notes": "O componente controla a navegação; não consulta a API nem divide os dados automaticamente.",
    "ts": "import { Component } from '@angular/core';\nimport { AeroPaginationComponent } from '@components/aero';\n\n@Component({\n  selector: 'app-exemplo',\n  standalone: true,\n  imports: [AeroPaginationComponent],\n  templateUrl: './exemplo.component.html',\n})\nexport class ExemploComponent {\n  page = 1;\n}\n"
  },
  {
    "id": "segmented",
    "name": "Navegação segmentada",
    "component": "AeroSegmentedComponent",
    "selector": "app-aero-segmented",
    "html": "<app-aero-segmented label=\"Visualização\"\n  [(value)]=\"view\" [options]=\"options\" />",
    "properties": [
      {
        "name": "label",
        "type": "string",
        "defaultValue": "'Visualização'",
        "description": "Nome acessível do grupo.",
        "kind": "Entrada"
      },
      {
        "name": "options",
        "type": "AeroOption[]",
        "defaultValue": "[]",
        "description": "Opções: { label: string; value: string | number; disabled?: boolean }.",
        "kind": "Entrada"
      },
      {
        "name": "value",
        "type": "string | number | null",
        "defaultValue": "null",
        "description": "Opção ativa; aceita [(value)].",
        "kind": "Entrada"
      },
      {
        "name": "valueChange",
        "type": "string | number",
        "defaultValue": "—",
        "description": "Valor selecionado.",
        "kind": "Evento"
      }
    ],
    "notes": "Grupo de botões de seleção. O conteúdo exibido para cada opção é controlado pela página.",
    "ts": "import { Component } from '@angular/core';\nimport { AeroSegmentedComponent, AeroOption } from '@components/aero';\n\n@Component({\n  selector: 'app-exemplo',\n  standalone: true,\n  imports: [AeroSegmentedComponent],\n  templateUrl: './exemplo.component.html',\n})\nexport class ExemploComponent {\n  view: string | number | null = 'overview';\n  options: AeroOption[] = [\n    { label: 'Visão geral', value: 'overview' },\n    { label: 'Histórico', value: 'history' },\n  ];\n}\n"
  },
  {
    "id": "table",
    "name": "Tabela",
    "component": "AeroTableComponent",
    "selector": "app-aero-table",
    "html": "<app-aero-table caption=\"Clientes\" [columns]=\"columns\" [rows]=\"rows\" />",
    "properties": [
      {
        "name": "caption",
        "type": "string",
        "defaultValue": "'Registros'",
        "description": "Legenda e nome acessível da tabela.",
        "kind": "Entrada"
      },
      {
        "name": "columns",
        "type": "AeroTableColumn[]",
        "defaultValue": "[]",
        "description": "Colunas: { key: string; label: string }.",
        "kind": "Entrada"
      },
      {
        "name": "rows",
        "type": "AeroTableRow[]",
        "defaultValue": "[]",
        "description": "Linhas do tipo Record<string, unknown>.",
        "kind": "Entrada"
      },
      {
        "name": "emptyMessage",
        "type": "string",
        "defaultValue": "'Nenhum registro encontrado.'",
        "description": "Mensagem quando não há linhas.",
        "kind": "Entrada"
      },
      {
        "name": "cellTemplate",
        "type": "TemplateRef<AeroTableCell> | null",
        "defaultValue": "null",
        "description": "Template opcional para todas as células: let-value ($implicit), let-row=\"row\" e let-column=\"column\".",
        "kind": "Entrada"
      }
    ],
    "notes": "Para células personalizadas, passe [cellTemplate]=\"cell\" e declare <ng-template #cell let-value let-row=\"row\" let-column=\"column\">. Os tipos são exportados por @components/aero.",
    "ts": "import { Component } from '@angular/core';\nimport { AeroTableComponent, AeroTableColumn, AeroTableRow } from '@components/aero';\n\n@Component({\n  selector: 'app-exemplo',\n  standalone: true,\n  imports: [AeroTableComponent],\n  templateUrl: './exemplo.component.html',\n})\nexport class ExemploComponent {\n  columns: AeroTableColumn[] = [\n    { key: 'name', label: 'Nome' },\n    { key: 'status', label: 'Situação' },\n  ];\n  rows: AeroTableRow[] = [\n    { name: 'Cliente exemplo', status: 'Ativo' },\n  ];\n}\n"
  }
];
