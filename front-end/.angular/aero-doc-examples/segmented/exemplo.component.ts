import { Component } from '@angular/core';
import { AeroSegmentedComponent, AeroOption } from '@components/aero';

@Component({
  selector: 'app-exemplo',
  standalone: true,
  imports: [AeroSegmentedComponent],
  templateUrl: './exemplo.component.html',
})
export class ExemploComponent {
  view: string | number | null = 'overview';
  options: AeroOption[] = [
    { label: 'Visão geral', value: 'overview' },
    { label: 'Histórico', value: 'history' },
  ];
}
