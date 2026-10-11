import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AeroSelectComponent, AeroOption } from '@components/aero';

@Component({
  selector: 'app-exemplo',
  standalone: true,
  imports: [ReactiveFormsModule, AeroSelectComponent],
  templateUrl: './exemplo.component.html',
})
export class ExemploComponent {
  category = new FormControl<string | number | null>(1);
  options: AeroOption[] = [
    { label: 'Equipamentos', value: 1 },
    { label: 'Serviços', value: 2 },
  ];
}
