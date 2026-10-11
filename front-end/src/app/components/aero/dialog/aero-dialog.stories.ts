import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import { AeroDialogComponent } from './aero-dialog.component';
const meta = {
  title: 'Aero/Feedback/Diálogo', component: AeroDialogComponent,
  args: { title: 'Confirmar ação', description: 'Nenhum dado será alterado neste exemplo.', destructive: false, confirmed: fn(), cancelled: fn() },
  render: (args) => ({ props: args, template: '<app-aero-button label="Abrir diálogo" variant="primary" (pressed)="dialog.open()" /><app-aero-dialog #dialog [title]="title" [description]="description" [destructive]="destructive" (confirmed)="confirmed()" (cancelled)="cancelled()" />' }),
} satisfies Meta<AeroDialogComponent>;
export default meta;
type Story = StoryObj<AeroDialogComponent>;
export const Padrao: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  const trigger = canvas.getByRole('button', { name: 'Abrir diálogo' });
  await userEvent.click(trigger);
  await expect(canvas.getByRole('dialog')).toBeVisible();
  await userEvent.click(canvas.getByRole('button', { name: 'Cancelar' }));
  await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
  await expect(args.cancelled).toHaveBeenCalled();
  await expect(trigger).toHaveFocus();
} };
export const Destrutivo: Story = { args: { destructive: true, title: 'Excluir registro' } };
