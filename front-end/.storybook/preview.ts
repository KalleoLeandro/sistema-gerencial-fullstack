import { moduleMetadata, type Preview } from '@storybook/angular';
import { AERO_COMPONENTS } from '../src/app/components/aero';

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [...AERO_COMPONENTS] }), (story, context) => {
    const theme = context.globals['theme'] === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset['theme'] = theme;
    document.documentElement.dataset['bsTheme'] = theme;
    return story();
  }],
  globalTypes: {
    theme: {
      description: 'Tema Aero',
      toolbar: { icon: 'circlehollow', dynamicTitle: true, items: [
        { value: 'light', title: 'Claro', icon: 'sun' },
        { value: 'dark', title: 'Escuro', icon: 'moon' },
      ] },
    },
  },
  parameters: {
    layout: 'padded',
    controls: { expanded: true },
    backgrounds: { disable: true },
    options: {
      storySort: { order: ['Aero', ['Introdução', 'Como importar', 'Botões', 'Formulários', 'Superfícies', 'Dados', 'Feedback', 'Catálogo completo']] },
    },
  },
  initialGlobals: { theme: 'light' },
};

export default preview;
