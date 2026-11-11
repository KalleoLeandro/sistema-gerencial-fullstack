import type { Meta, StoryObj } from '@storybook/angular';
import { AeroSelectComponent } from './aero-select.component';
const meta = {
  title: 'Aero/Formulários/Seleção', component: AeroSelectComponent,
  args: { label: 'Categoria', value: 'equipment', options: [{ label: 'Equipamentos', value: 'equipment' }, { label: 'Serviços', value: 'services' }, { label: 'Produtos', value: 'products' }] },
} satisfies Meta<AeroSelectComponent>;
export default meta;
type Story = StoryObj<AeroSelectComponent>;
export const Padrao: Story = {};
export const SemSelecao: Story = { args: { value: null } };
export const Desabilitado: Story = { args: { disabled: true } };
export const Erro: Story = { args: { value: null, invalid: true, error: 'Selecione uma categoria.' } };
