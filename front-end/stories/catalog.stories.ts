import type { Meta, StoryObj } from '@storybook/angular';
import { DesignSystemComponent } from '../src/app/pages/design-system/design-system.component';

const meta: Meta<DesignSystemComponent> = {
  title: 'Aero/Catálogo completo',
  component: DesignSystemComponent,
  parameters: { layout: 'padded', docs: { description: { component: 'O mesmo componente utilizado na rota /design-system, executado isoladamente e sem autenticação.' } } },
};
export default meta;
export const Completo: StoryObj<DesignSystemComponent> = {};
