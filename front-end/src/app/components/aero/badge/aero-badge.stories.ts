import type { Meta, StoryObj } from '@storybook/angular';
import { AeroBadgeComponent } from './aero-badge.component';
const meta = { title: 'Aero/Feedback/Situação', component: AeroBadgeComponent,
  args: { label: 'Em andamento', tone: 'info' },
  argTypes: { tone: { control: 'select', options: ['info', 'success', 'warning'] } },
} satisfies Meta<AeroBadgeComponent>;
export default meta;
type Story = StoryObj<AeroBadgeComponent>;
export const Informacao: Story = {};
export const Sucesso: Story = { args: { label: 'Concluído', tone: 'success' } };
export const Pendente: Story = { args: { label: 'Pendente', tone: 'warning' } };
