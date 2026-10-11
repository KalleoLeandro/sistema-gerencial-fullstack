import type { Meta, StoryObj } from '@storybook/angular';
import { AeroPaginationComponent } from './aero-pagination.component';
const meta = { title: 'Aero/Dados/Paginação', component: AeroPaginationComponent,
  args: { page: 1, totalPages: 3 },
  render: (args) => ({ props: args, template: '<app-aero-pagination [(page)]="page" [totalPages]="totalPages" />' }),
} satisfies Meta<AeroPaginationComponent>;
export default meta;
type Story = StoryObj<AeroPaginationComponent>;
export const PrimeiraPagina: Story = {};
export const UltimaPagina: Story = { args: { page: 3 } };
export const PaginaUnica: Story = { args: { totalPages: 1 } };
