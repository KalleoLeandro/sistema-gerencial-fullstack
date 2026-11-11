import type { Meta, StoryObj } from '@storybook/angular';
import { fn } from 'storybook/test';
import { AeroFileComponent } from './aero-file.component';
const meta = { title: 'Aero/Formulários/Arquivo', component: AeroFileComponent,
  args: { label: 'Anexo', hint: 'Selecione um arquivo local. Nenhum upload é realizado.', multiple: false, filesSelected: fn() },
} satisfies Meta<AeroFileComponent>;
export default meta;
type Story = StoryObj<AeroFileComponent>;
export const Padrao: Story = {};
export const Imagens: Story = { args: { accept: 'image/*', multiple: true } };
export const Desabilitado: Story = { args: { disabled: true } };
