import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AERO_COMPONENTS, AeroOption, AeroTableRow } from '@components/aero';
import { AeroUsageComponent } from './docs/aero-usage.component';

@Component({
  selector: 'app-design-system',
  standalone: true,
  imports: [ReactiveFormsModule, ...AERO_COMPONENTS, AeroUsageComponent],
  templateUrl: './design-system.component.html',
  styleUrl: './design-system.component.css'
})
export class DesignSystemComponent {
  protected readonly notice = signal('');
  protected readonly page = signal(1);
  protected readonly tab = signal<string | number>('overview');
  protected readonly categories: AeroOption[] = [{ label: 'Equipamentos', value: 'equipment' }, { label: 'Serviços', value: 'services' }, { label: 'Produtos', value: 'products' }];
  protected readonly serviceTypes: AeroOption[] = [{ label: 'Presencial', value: 'local' }, { label: 'Remoto', value: 'remote' }];
  protected readonly views: AeroOption[] = [{ label: 'Visão geral', value: 'overview' }, { label: 'Histórico', value: 'history' }];
  protected readonly columns = [{ key: 'order', label: 'Ordem' }, { key: 'client', label: 'Cliente' }, { key: 'status', label: 'Situação' }];
  protected readonly rows: AeroTableRow[][] = [
    [{ order: 'OS-0001', client: 'Cliente exemplo', status: 'Concluído' }, { order: 'OS-0002', client: 'Empresa demonstração', status: 'Pendente' }],
    [{ order: 'OS-0003', client: 'Cliente demonstração', status: 'Em andamento' }],
  ];
  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: Validators.required }),
    email: new FormControl('', { nonNullable: true, validators: Validators.email }),
    category: new FormControl('equipment'), search: new FormControl(''), date: new FormControl(''), time: new FormControl(''),
    quantity: new FormControl(1, Validators.min(1)), priority: new FormControl(3),
    notify: new FormControl(true), active: new FormControl(false), service: new FormControl('local'), notes: new FormControl(''),
  });

  protected save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.notice.set('Confira os campos destacados antes de continuar.');
      return;
    }
    this.notice.set('Exemplo validado com sucesso. Nenhum dado foi enviado.');
  }
}
