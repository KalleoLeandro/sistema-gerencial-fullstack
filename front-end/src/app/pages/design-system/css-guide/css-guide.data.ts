export interface CssRecipe {
  id: string;
  title: string;
  description: string;
  classes: string;
  html: string;
  css?: string;
}

export const CSS_RECIPES: CssRecipe[] = [
  {
    "id": "surfaces",
    "title": "Divs, cards e superfícies glass",
    "description": "aero-card fornece espaçamento, borda e cantos arredondados. Combine com aero-glass para adicionar o acabamento de vidro.",
    "classes": "aero-card · aero-glass",
    "html": "<div class=\"aero-card aero-glass\">\n  <h3>Resumo do atendimento</h3>\n  <p>Uma div com superfície glass e conteúdo nativo.</p>\n</div>"
  },
  {
    "id": "panels",
    "title": "Painéis coloridos",
    "description": "Use a classe base aero-panel e escolha o tom. O espaçamento e os cantos deste exemplo são definidos pelo CSS complementar.",
    "classes": "aero-panel · aero-panel-green · aero-panel-blue",
    "html": "<div class=\"guide-panels\">\n  <div class=\"aero-panel aero-panel-green guide-panel\">Painel verde</div>\n  <div class=\"aero-panel aero-panel-blue guide-panel\">Painel azul</div>\n</div>",
    "css": ".guide-panels {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1rem;\n}\n.guide-panel {\n  padding: 1.25rem;\n  border-radius: 1rem;\n}"
  },
  {
    "id": "buttons",
    "title": "Botões nativos",
    "description": "Mantenha aero-button e acrescente uma variação. O atributo disabled controla o estado desabilitado; a classe não implementa ações de negócio.",
    "classes": "aero-button · aero-button--primary · aero-button--success · aero-button--danger · aero-button--quiet",
    "html": "<div class=\"app-form-actions\">\n  <button type=\"button\" class=\"aero-button aero-button--primary\">Principal</button>\n  <button type=\"button\" class=\"aero-button\">Secundário</button>\n  <button type=\"button\" class=\"aero-button aero-button--success\">Confirmar</button>\n  <button type=\"button\" class=\"aero-button aero-button--danger\">Excluir</button>\n  <button type=\"button\" class=\"aero-button aero-button--quiet\">Discreto</button>\n  <button type=\"button\" class=\"aero-button\" disabled>Indisponível</button>\n</div>"
  },
  {
    "id": "fields",
    "title": "Campos e grid de formulário",
    "description": "app-form-grid organiza os campos em 12 colunas no desktop. span-6 ocupa metade e span-12 ocupa a linha inteira; o grid se adapta em telas menores. Vincule labels e mensagens aos campos.",
    "classes": "app-form-grid · span-6 · span-12 · aero-field · aero-input · aero-select · aero-textarea · aero-error",
    "html": "<div class=\"app-form-grid\">\n  <div class=\"aero-field span-6\">\n    <label for=\"css-name\">Nome</label>\n    <input id=\"css-name\" class=\"aero-input\" placeholder=\"Nome do cliente\">\n  </div>\n  <div class=\"aero-field span-6\">\n    <label for=\"css-category\">Categoria</label>\n    <select id=\"css-category\" class=\"aero-select\">\n      <option>Equipamentos</option>\n      <option>Serviços</option>\n    </select>\n  </div>\n  <div class=\"aero-field span-6\">\n    <label for=\"css-email\">E-mail com erro</label>\n    <input id=\"css-email\" type=\"email\" class=\"aero-input\"\n      aria-invalid=\"true\" aria-describedby=\"css-email-error\">\n    <small id=\"css-email-error\" class=\"aero-error\">Informe um e-mail válido.</small>\n  </div>\n  <div class=\"aero-field span-6\">\n    <label for=\"css-disabled\">Campo desabilitado</label>\n    <input id=\"css-disabled\" class=\"aero-input\" value=\"Indisponível\" disabled>\n  </div>\n  <div class=\"aero-field span-12\">\n    <label for=\"css-notes\">Observações</label>\n    <textarea id=\"css-notes\" class=\"aero-textarea\" placeholder=\"Descreva os detalhes\"></textarea>\n  </div>\n</div>"
  },
  {
    "id": "choices",
    "title": "Checkboxes e rádios",
    "description": "Aplique aero-choice ao grupo. Os elementos nativos mantêm a seleção, o foco e a navegação por teclado. Rádios do mesmo grupo precisam compartilhar name.",
    "classes": "aero-choice",
    "html": "<fieldset class=\"aero-choice\">\n  <legend>Preferências</legend>\n  <label><input type=\"checkbox\" checked>Receber notificações</label>\n  <label><input type=\"radio\" name=\"css-service\" value=\"local\" checked>Presencial</label>\n  <label><input type=\"radio\" name=\"css-service\" value=\"remote\">Remoto</label>\n</fieldset>"
  },
  {
    "id": "feedback",
    "title": "Situações, alertas e progresso",
    "description": "Combine a classe base com o tom desejado. O percentual é configurado pelo atributo value do progress. Em mensagens dinâmicas, use role=\"status\" ou role=\"alert\" conforme a necessidade.",
    "classes": "aero-badge · aero-badge--success · aero-badge--warning · aero-alert · aero-alert--error · aero-progress",
    "html": "<div class=\"guide-stack\">\n  <div>\n    <span class=\"aero-badge\">Em andamento</span>\n    <span class=\"aero-badge aero-badge--success\">Concluído</span>\n    <span class=\"aero-badge aero-badge--warning\">Pendente</span>\n  </div>\n  <div class=\"aero-alert\">Informação sobre o atendimento.</div>\n  <div class=\"aero-alert aero-alert--error\">Exemplo de mensagem de erro.</div>\n  <label for=\"css-progress\">Carregamento · 65%</label>\n  <progress id=\"css-progress\" class=\"aero-progress\" max=\"100\" value=\"65\">65%</progress>\n</div>",
    "css": ".guide-stack {\n  display: grid;\n  gap: 1rem;\n}"
  },
  {
    "id": "table",
    "title": "Tabelas HTML",
    "description": "aero-table estiliza a tabela; aero-table-wrap fornece borda e rolagem horizontal. Preserve caption e os cabeçalhos semânticos.",
    "classes": "aero-table-wrap · aero-table",
    "html": "<div class=\"aero-table-wrap\" tabindex=\"0\" role=\"region\" aria-label=\"Clientes\">\n  <table class=\"aero-table\">\n    <caption>Clientes de exemplo</caption>\n    <thead><tr><th scope=\"col\">Nome</th><th scope=\"col\">Situação</th></tr></thead>\n    <tbody>\n      <tr><td>Cliente exemplo</td><td><span class=\"aero-badge aero-badge--success\">Ativo</span></td></tr>\n      <tr><td>Empresa demonstração</td><td><span class=\"aero-badge aero-badge--warning\">Pendente</span></td></tr>\n    </tbody>\n  </table>\n</div>"
  },
  {
    "id": "details",
    "title": "Seções expansíveis",
    "description": "Aplique aero-details ao elemento details. A abertura e o fechamento funcionam nativamente; adicione open para iniciar expandido.",
    "classes": "aero-details",
    "html": "<details class=\"aero-details\">\n  <summary>Informações adicionais</summary>\n  <p>Este conteúdo pode ser expandido sem JavaScript.</p>\n</details>"
  },
  {
    "id": "tokens",
    "title": "Personalização com variáveis CSS",
    "description": "Você pode ajustar variáveis no escopo de uma div e reutilizar as classes existentes. As classes guide-* deste guia são exemplos locais: copie o CSS complementar junto com o HTML.",
    "classes": "aero-card · aero-highlight-text · --aero-border · --aero-text",
    "html": "<div class=\"aero-card guide-custom-card\">\n  <h3 class=\"aero-highlight-text\">Card personalizado</h3>\n  <p>Mesma base Aero, com borda ajustada apenas neste card.</p>\n</div>",
    "css": ".guide-custom-card {\n  --aero-border: #88bda8;\n  color: var(--aero-text);\n  max-width: 36rem;\n}"
  }
];
