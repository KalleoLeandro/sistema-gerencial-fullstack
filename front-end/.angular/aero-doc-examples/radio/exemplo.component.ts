import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AeroRadioGroupComponent, AeroOption } from '@components/aero';

@Component({
  selector: 'app-exemplo',
  standalone: true,
  imports: [ReactiveFormsModule, AeroRadioGroupComponent],
  templateUrl: './exemplo.component.html',
})
export class ExemploComponent {
  service = new FormControl<string | number | null>('local');
  options: AeroOption[] = [
    { label: 'Presencial', value: 'local' },
    { label: 'Remoto', value: 'remote' },
  ];
}
