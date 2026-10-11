import type { Meta, StoryObj } from '@storybook/angular';
import { AeroTextareaComponent } from './aero-textarea.component';
const meta = { title: 'Aero/Formulários/Área de texto', component: AeroTextareaComponent,
  args: { label: 'Observações', placeholder: 'Descreva os detalhes', rows: 4, value: '' },
} satisfies Meta<AeroTextareaComponent>;
export default meta;
type Story = StoryObj<AeroTextareaComponent>;
export const Padrao: Story = {};
export const SomenteLeitura: Story = { args: { readonly: true, value: 'Atendimento finalizado.' } };
export const Erro: Story = { args: { invalid: true, error: 'Informe os detalhes.' } };
