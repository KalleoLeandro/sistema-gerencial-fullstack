import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AeroTextareaComponent } from '@components/aero';

@Component({
  selector: 'app-exemplo',
  standalone: true,
  imports: [ReactiveFormsModule, AeroTextareaComponent],
  templateUrl: './exemplo.component.html',
})
export class ExemploComponent {
  notes = new FormControl('', { nonNullable: true });
}
