import { Component } from '@angular/core';
import { AeroButtonComponent } from '@components/aero';

@Component({
  selector: 'app-exemplo',
  standalone: true,
  imports: [AeroButtonComponent],
  templateUrl: './exemplo.component.html',
})
export class ExemploComponent {
  saving = false;
  message = '';

  save(): void {
    this.message = 'Ação recebida.';
  }
}
