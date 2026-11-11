import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, within } from 'storybook/test';
import { AeroInputComponent } from './aero-input.component';

const meta = {
  title: 'Aero/Formulários/Campo', component: AeroInputComponent,
  args: { label: 'Nome', placeholder: 'Digite o nome', hint: 'Informe o nome completo.', value: '', type: 'text', disabled: false, readonly: false, invalid: false },
  argTypes: { type: { control: 'select', options: ['text', 'email', 'password', 'search', 'number', 'date', 'time', 'tel', 'url', 'range'] } },
  parameters: { docs: { description: { component: 'Campo standalone com ControlValueAccessor. Datas e horários retornam strings; números retornam number ou null. Validadores devem ser configurados no FormControl.' } } },
} satisfies Meta<AeroInputComponent>;
export default meta;
type Story = StoryObj<AeroInputComponent>;
export const Texto: Story = { play: async ({ canvasElement }) => {
  const input = within(canvasElement).getByRole('textbox');
  await userEvent.clear(input);
  await userEvent.type(input, 'Cliente exemplo');
  await expect(input).toHaveValue('Cliente exemplo');
} };
export const Erro: Story = { args: { invalid: true, value: 'Valor inválido', error: 'Confira o valor informado.' } };
export const Desabilitado: Story = { args: { disabled: true, value: 'Indisponível' } };
export const SomenteLeitura: Story = { args: { readonly: true, value: 'OS-0001' } };
export const Email: Story = { args: { type: 'email', label: 'E-mail', placeholder: 'nome@empresa.com' } };
export const Data: Story = { args: { type: 'date', label: 'Data', hint: 'Selecione a data.' } };
export const Horario: Story = { args: { type: 'time', label: 'Horário', hint: 'Selecione o horário.' } };
export const Quantidade: Story = { args: { type: 'number', label: 'Quantidade', value: 1, min: 1, hint: 'Informe a quantidade.' } };
export const Prioridade: Story = { args: { type: 'range', label: 'Prioridade', value: 3, min: 1, max: 5, hint: 'De 1 a 5.' } };
export const Sugestoes: Story = { args: { type: 'search', label: 'Cliente', suggestions: ['Cliente exemplo', 'Empresa demonstração'] } };
