import type { Meta, StoryObj } from '@storybook/angular';
import { AeroTableComponent } from './aero-table.component';
const meta = { title: 'Aero/Dados/Tabela', component: AeroTableComponent,
  args: { caption: 'Ordens de serviço · Dados demonstrativos',
    columns: [{ key: 'order', label: 'Ordem' }, { key: 'client', label: 'Cliente' }, { key: 'status', label: 'Situação' }],
    rows: [{ order: 'OS-0001', client: 'Cliente exemplo', status: 'Concluído' }, { order: 'OS-0002', client: 'Empresa demonstração', status: 'Pendente' }] },
} satisfies Meta<AeroTableComponent>;
export default meta;
type Story = StoryObj<AeroTableComponent>;
export const Padrao: Story = {};
export const Vazio: Story = { args: { rows: [] } };
export const CelulaPersonalizada: Story = { render: (args) => ({ props: args, template: '<app-aero-table [caption]="caption" [columns]="columns" [rows]="rows" [cellTemplate]="cell" /><ng-template #cell let-value let-column="column">@if (column.key === \'status\') { <app-aero-badge [label]="value" [tone]="value === \'Concluído\' ? \'success\' : \'warning\'" /> } @else { {{ value }} }</ng-template>' }) };
