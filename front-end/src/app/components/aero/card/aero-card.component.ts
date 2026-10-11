import { Component, Input, booleanAttribute } from '@angular/core';

@Component({
  selector: 'app-aero-card', standalone: true,
  template: `<section class="aero-card" [class.aero-glass]="glass"><ng-content /></section>`,
  styles: [':host { display: block; min-width: 0; }'],
})
export class AeroCardComponent {
  @Input({ transform: booleanAttribute }) glass = false;
}
