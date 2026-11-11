import { Component } from '@angular/core';
import { AeroPaginationComponent } from '@components/aero';

@Component({
  selector: 'app-exemplo',
  standalone: true,
  imports: [AeroPaginationComponent],
  templateUrl: './exemplo.component.html',
})
export class ExemploComponent {
  page = 1;
}
