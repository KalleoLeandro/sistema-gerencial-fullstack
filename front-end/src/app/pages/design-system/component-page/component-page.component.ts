import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AERO_COMPONENTS, AeroOption, AeroTableRow, AeroFieldComponent, AeroNativeControlComponent, AeroNativeButtonComponent, AeroDateDirective } from '@components/aero';
import { AERO_USAGE_DOCS } from '../docs/aero-usage.data';
import { AeroUsageComponent } from '../docs/aero-usage.component';

@Component({
  selector: 'app-aero-component-page',
  standalone: true,
  imports: [ReactiveFormsModule, ...AERO_COMPONENTS, AeroUsageComponent, AeroFieldComponent, AeroNativeControlComponent, AeroNativeButtonComponent, AeroDateDirective],
  templateUrl: './component-page.component.html',
  styleUrl: './component-page.component.css',
})
export class ComponentPageComponent {
  private readonly route = inject(ActivatedRoute);
  protected readonly doc = AERO_USAGE_DOCS.find(doc => doc.id === this.route.snapshot.data['componentId'])!;
  protected readonly message = signal('');
  protected readonly name = new FormControl('', { nonNullable: true, validators: Validators.required });
  protected readonly nativeDate = new FormControl<Date | null>(new Date());
  protected readonly category = new FormControl<string | number | null>('equipment');
  protected readonly notes = new FormControl('', { nonNullable: true });
  protected readonly notify = new FormControl(true, { nonNullable: true });
  protected readonly active = new FormControl(false, { nonNullable: true });
  protected readonly service = new FormControl<string | number | null>('local');
  protected readonly progress = new FormControl(65, { nonNullable: true });
  protected expanded = false;
  protected page = 1;
  protected view: string | number | null = 'overview';
  protected readonly categories: AeroOption[] = [{ label: 'Equipamentos', value: 'equipment' }, { label: 'Serviços', value: 'services' }];
  protected readonly services: AeroOption[] = [{ label: 'Presencial', value: 'local' }, { label: 'Remoto', value: 'remote' }];
  protected readonly views: AeroOption[] = [{ label: 'Visão geral', value: 'overview' }, { label: 'Histórico', value: 'history' }];
  protected readonly columns = [{ key: 'order', label: 'Ordem' }, { key: 'client', label: 'Cliente' }, { key: 'status', label: 'Situação' }];
  protected readonly rows: AeroTableRow[] = [{ order: 'OS-0001', client: 'Cliente exemplo', status: 'Concluído' }, { order: 'OS-0002', client: 'Empresa demonstração', status: 'Pendente' }];
}
