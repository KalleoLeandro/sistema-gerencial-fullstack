import { Component } from '@angular/core';
import { AeroDetailsComponent } from '@components/aero';

@Component({
  selector: 'app-exemplo',
  standalone: true,
  imports: [AeroDetailsComponent],
  templateUrl: './exemplo.component.html',
})
export class ExemploComponent {
  expanded = false;
}
