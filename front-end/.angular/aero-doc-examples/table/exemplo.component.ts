import { Component } from '@angular/core';
import { AeroTableComponent, AeroTableColumn, AeroTableRow } from '@components/aero';

@Component({
  selector: 'app-exemplo',
  standalone: true,
  imports: [AeroTableComponent],
  templateUrl: './exemplo.component.html',
})
export class ExemploComponent {
  columns: AeroTableColumn[] = [
    { key: 'name', label: 'Nome' },
    { key: 'status', label: 'Situação' },
  ];
  rows: AeroTableRow[] = [
    { name: 'Cliente exemplo', status: 'Ativo' },
  ];
}
