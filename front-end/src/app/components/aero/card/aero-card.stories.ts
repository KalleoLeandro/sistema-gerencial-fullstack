import type { Meta, StoryObj } from '@storybook/angular';
import { AeroCardComponent } from './aero-card.component';
const meta = { title: 'Aero/Superfícies/Card', component: AeroCardComponent, args: { glass: false },
  render: (args) => ({ props: args, template: '<app-aero-card [glass]="glass"><h2>Ordem de serviço</h2><p>Informações organizadas em uma superfície clara.</p><app-aero-button variant="primary" label="Ver detalhes" /></app-aero-card>' }),
} satisfies Meta<AeroCardComponent>;
export default meta;
type Story = StoryObj<AeroCardComponent>;
export const Padrao: Story = {};
export const Glass: Story = { args: { glass: true } };
