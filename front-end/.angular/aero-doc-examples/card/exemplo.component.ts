import { Component } from '@angular/core';
import { AeroCardComponent } from '@components/aero';

@Component({
  selector: 'app-exemplo',
  standalone: true,
  imports: [AeroCardComponent],
  templateUrl: './exemplo.component.html',
})
export class ExemploComponent {}
