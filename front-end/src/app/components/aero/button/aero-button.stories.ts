import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import { AeroButtonComponent } from './aero-button.component';

const meta = {
  title: 'Aero/Botões', component: AeroButtonComponent,
  args: { label: 'Salvar alterações', variant: 'primary', disabled: false, loading: false, pressed: fn() },
  argTypes: { variant: { control: 'select', options: ['primary', 'secondary', 'success', 'danger', 'quiet'] } },
} satisfies Meta<AeroButtonComponent>;
export default meta;
type Story = StoryObj<AeroButtonComponent>;
export const Principal: Story = { play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: args.label }));
  await expect(args.pressed).toHaveBeenCalled();
} };
export const Secundario: Story = { args: { variant: 'secondary', label: 'Cancelar' } };
export const Sucesso: Story = { args: { variant: 'success', label: 'Confirmar' } };
export const Perigo: Story = { args: { variant: 'danger', label: 'Excluir' } };
export const Discreto: Story = { args: { variant: 'quiet', label: 'Ver detalhes' } };
export const Desabilitado: Story = { args: { disabled: true } };
export const Carregando: Story = { args: { loading: true, label: 'Salvando…' } };
