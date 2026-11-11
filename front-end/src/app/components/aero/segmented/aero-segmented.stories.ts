import type { Meta, StoryObj } from '@storybook/angular';
import { AeroSegmentedComponent } from './aero-segmented.component';
const meta = { title: 'Aero/Dados/Navegação', component: AeroSegmentedComponent,
  args: { label: 'Visualização', value: 'overview', options: [{ label: 'Visão geral', value: 'overview' }, { label: 'Histórico', value: 'history' }] },
  render: (args) => ({ props: args, template: '<app-aero-segmented [label]="label" [options]="options" [(value)]="value" /><p style="margin-top:1rem">{{ value === \'overview\' ? \'Resumo do atendimento.\' : \'Nenhuma alteração registrada.\' }}</p>' }),
} satisfies Meta<AeroSegmentedComponent>;
export default meta;
export const Padrao: StoryObj<AeroSegmentedComponent> = {};
