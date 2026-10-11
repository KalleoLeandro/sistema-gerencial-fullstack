import { Component, EventEmitter, Input, Output, booleanAttribute } from '@angular/core';

@Component({
  selector: 'app-aero-details', standalone: true,
  template: `<details class="aero-details" [open]="expanded" (toggle)="toggle($event)"><summary>{{ label }}</summary><ng-content /></details>`,
  styles: [':host { display: block; }'],
})
export class AeroDetailsComponent {
  @Input() label = 'Detalhes';
  @Input({ transform: booleanAttribute }) expanded = false;
  @Output() expandedChange = new EventEmitter<boolean>();
  protected toggle(event: Event): void {
    this.expanded = (event.target as HTMLDetailsElement).open;
    this.expandedChange.emit(this.expanded);
  }
}
