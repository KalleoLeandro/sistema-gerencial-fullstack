import { Component } from '@angular/core';
import { AeroAlertComponent } from '@components/aero';

@Component({
  selector: 'app-exemplo',
  standalone: true,
  imports: [AeroAlertComponent],
  templateUrl: './exemplo.component.html',
})
export class ExemploComponent {}
