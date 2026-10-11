import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-aero-badge', standalone: true,
  template: `<span [class]="'aero-badge aero-badge--' + tone">{{ label }}<ng-content /></span>`,
})
export class AeroBadgeComponent {
  @Input() label = '';
  @Input() tone: 'info' | 'success' | 'warning' = 'info';
}
