import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AeroCheckboxComponent } from '@components/aero';

@Component({
  selector: 'app-exemplo',
  standalone: true,
  imports: [ReactiveFormsModule, AeroCheckboxComponent],
  templateUrl: './exemplo.component.html',
})
export class ExemploComponent {
  notify = new FormControl(false, { nonNullable: true });
}
