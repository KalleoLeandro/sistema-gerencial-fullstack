import { Component } from '@angular/core';
import { AeroProgressComponent } from '@components/aero';

@Component({
  selector: 'app-exemplo',
  standalone: true,
  imports: [AeroProgressComponent],
  templateUrl: './exemplo.component.html',
})
export class ExemploComponent {}
