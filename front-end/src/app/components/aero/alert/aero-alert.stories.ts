import type { Meta, StoryObj } from '@storybook/angular';
import { AeroAlertComponent } from './aero-alert.component';
const meta = { title: 'Aero/Feedback/Alerta', component: AeroAlertComponent,
  args: { message: 'Os dados desta biblioteca são demonstrativos.', tone: 'info' },
  argTypes: { tone: { control: 'select', options: ['info', 'error'] } },
} satisfies Meta<AeroAlertComponent>;
export default meta;
type Story = StoryObj<AeroAlertComponent>;
export const Informacao: Story = {};
export const Erro: Story = { args: { message: 'Não foi possível concluir a operação. Tente novamente.', tone: 'error' } };
export const Notificacao: Story = { render: () => ({ props: { message: '' }, template: '<app-aero-button label="Salvar exemplo" variant="success" (pressed)="message = \'Alterações salvas com sucesso.\'" /><app-aero-alert liveRole="status" [message]="message" />' }) };
