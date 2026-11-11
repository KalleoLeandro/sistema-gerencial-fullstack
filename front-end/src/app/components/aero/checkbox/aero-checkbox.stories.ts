import type { Meta, StoryObj } from '@storybook/angular';
import { AeroCheckboxComponent } from './aero-checkbox.component';
const meta = { title: 'Aero/Formulários/Checkbox e switch', component: AeroCheckboxComponent,
  args: { label: 'Receber notificações', value: false, kind: 'checkbox', disabled: false },
  argTypes: { kind: { control: 'select', options: ['checkbox', 'switch'] } },
} satisfies Meta<AeroCheckboxComponent>;
export default meta;
type Story = StoryObj<AeroCheckboxComponent>;
export const Checkbox: Story = {};
export const Marcado: Story = { args: { value: true } };
export const Switch: Story = { args: { kind: 'switch', label: 'Ativo' } };
export const Desabilitado: Story = { args: { disabled: true } };
