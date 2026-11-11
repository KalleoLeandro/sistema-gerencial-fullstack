import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-aero-alert', standalone: true,
  template: `<div class="aero-alert" [class.aero-alert--error]="tone === 'error'" [attr.role]="liveRole">
    {{ message }}<ng-content />
  </div>`,
  styles: [':host { display: block; }'],
})
export class AeroAlertComponent {
  @Input() message = '';
  @Input() tone: 'info' | 'error' = 'info';
  /** Set only for dynamic notifications; static examples need no live announcement. */
  @Input() liveRole: 'status' | 'alert' | null = null;
}
