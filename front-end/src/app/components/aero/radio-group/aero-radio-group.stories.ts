import type { Meta, StoryObj } from '@storybook/angular';
import { AeroRadioGroupComponent } from './aero-radio-group.component';
const meta = { title: 'Aero/Formulários/Grupo de rádio', component: AeroRadioGroupComponent,
  args: { label: 'Tipo de atendimento', value: 'local', options: [{ label: 'Presencial', value: 'local' }, { label: 'Remoto', value: 'remote' }] },
} satisfies Meta<AeroRadioGroupComponent>;
export default meta;
type Story = StoryObj<AeroRadioGroupComponent>;
export const Padrao: Story = {};
export const Desabilitado: Story = { args: { disabled: true } };
