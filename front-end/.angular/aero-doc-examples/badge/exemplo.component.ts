import { Component } from '@angular/core';
import { AeroBadgeComponent } from '@components/aero';

@Component({
  selector: 'app-exemplo',
  standalone: true,
  imports: [AeroBadgeComponent],
  templateUrl: './exemplo.component.html',
})
export class ExemploComponent {}
