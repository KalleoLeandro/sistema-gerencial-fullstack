import type { Meta, StoryObj } from '@storybook/angular';
import { AeroProgressComponent } from './aero-progress.component';
const meta = { title: 'Aero/Feedback/Progresso', component: AeroProgressComponent,
  args: { value: 65, label: 'Carregamento', indeterminate: false },
  argTypes: { value: { control: { type: 'range', min: 0, max: 100 } } },
} satisfies Meta<AeroProgressComponent>;
export default meta;
type Story = StoryObj<AeroProgressComponent>;
export const Padrao: Story = {};
export const Indeterminado: Story = { args: { indeterminate: true } };
