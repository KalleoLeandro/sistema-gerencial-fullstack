import type { Meta, StoryObj } from '@storybook/angular';
import { AeroDetailsComponent } from './aero-details.component';
const meta = { title: 'Aero/Superfícies/Seção expansível', component: AeroDetailsComponent,
  args: { label: 'Informações adicionais', expanded: false },
  render: (args) => ({ props: args, template: '<app-aero-details [label]="label" [(expanded)]="expanded"><p>Detalhes complementares do atendimento.</p></app-aero-details>' }),
} satisfies Meta<AeroDetailsComponent>;
export default meta;
type Story = StoryObj<AeroDetailsComponent>;
export const Recolhido: Story = {};
export const Expandido: Story = { args: { expanded: true } };
