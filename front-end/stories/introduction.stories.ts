import type { Meta, StoryObj } from '@storybook/angular';

const meta: Meta = { title: 'Aero/Introdução', parameters: { layout: 'padded' } };
export default meta;
export const BoasVindas: StoryObj = {
  render: () => ({ template: `<article class="aero-card" style="max-width:54rem;margin:auto">
    <span class="aero-badge">Leal · Design system</span><h1 style="margin-top:1rem">Aero</h1>
    <p>Fundo branco, superfícies de vidro e detalhes em azul e verde.</p>
    <p>Explore os componentes no menu lateral. A aba Controls permite experimentar os estados; Docs reúne as variações e o código de uso; Accessibility inspeciona o exemplo exibido.</p>
    <div style="display:flex;flex-wrap:wrap;gap:1rem;margin:1.5rem 0">
      <div class="aero-card" style="background:#fff">Branco · Base</div>
      <div class="aero-card" style="background:#e6f5fd">Azul · Ações</div>
      <div class="aero-card" style="background:#e5f7ed">Verde · Sucesso</div>
    </div>
    <h2>Uma única base visual</h2><p>As histórias usam as classes de src/aero.css e os estilos globais da aplicação. Os exemplos funcionam sem login e sem conexão com a API.</p>
    <h2>Uso acessível</h2><p>Preserve labels, mensagens de validação, foco visível e navegação por teclado. Os controles nativos de data e seleção podem variar conforme o navegador.</p>
  </article>` }),
};
