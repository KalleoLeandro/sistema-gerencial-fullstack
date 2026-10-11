import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AeroInputComponent } from '@components/aero';

@Component({
  selector: 'app-exemplo',
  standalone: true,
  imports: [ReactiveFormsModule, AeroInputComponent],
  templateUrl: './exemplo.component.html',
})
export class ExemploComponent {
  name = new FormControl('', { nonNullable: true, validators: Validators.required });
}
