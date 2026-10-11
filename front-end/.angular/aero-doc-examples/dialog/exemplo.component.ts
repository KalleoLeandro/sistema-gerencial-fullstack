import { Component } from '@angular/core';
import { AeroDialogComponent, AeroButtonComponent } from '@components/aero';

@Component({
  selector: 'app-exemplo',
  standalone: true,
  imports: [AeroDialogComponent, AeroButtonComponent],
  templateUrl: './exemplo.component.html',
})
export class ExemploComponent {
  message = '';

  confirm(): void {
    this.message = 'Confirmação recebida.';
  }
}
