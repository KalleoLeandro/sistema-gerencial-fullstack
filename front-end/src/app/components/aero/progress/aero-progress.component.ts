import { Component, Input, booleanAttribute } from '@angular/core';

let nextProgressId = 0;
@Component({
  selector: 'app-aero-progress', standalone: true,
  template: `<div class="aero-field"><label [for]="controlId">{{ label }} @if (!indeterminate) { · {{ percentage }}% }</label>
    <progress class="aero-progress" [id]="controlId" max="100" [attr.value]="indeterminate ? null : percentage">{{ percentage }}%</progress>
  </div>`,
  styles: [':host { display: block; }'],
})
export class AeroProgressComponent {
  readonly controlId = `aero-progress-${++nextProgressId}`;
  @Input() label = 'Carregamento';
  @Input() value = 0;
  @Input({ transform: booleanAttribute }) indeterminate = false;
  get percentage(): number { return Number.isFinite(this.value) ? Math.min(100, Math.max(0, this.value)) : 0; }
}
