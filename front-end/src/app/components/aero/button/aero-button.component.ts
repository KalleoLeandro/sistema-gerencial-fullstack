import { Component, EventEmitter, Input, Output, booleanAttribute } from '@angular/core';

export type AeroButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'quiet';

@Component({
  selector: 'app-aero-button',
  standalone: true,
  template: `<button [type]="type" [class]="'aero-button aero-button--' + variant"
    [disabled]="disabled || loading" [attr.aria-busy]="loading || null"
    [attr.aria-label]="accessibleLabel || null" (click)="pressed.emit($event)">
    @if (loading) { <span class="aero-spinner" aria-hidden="true"></span> }
    {{ label }}<ng-content />
  </button>`,
  styles: [':host { display: inline-block; }'],
})
export class AeroButtonComponent {
  @Input() label = '';
  @Input() accessibleLabel = '';
  @Input() variant: AeroButtonVariant = 'secondary';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input({ transform: booleanAttribute }) disabled = false;
  @Input({ transform: booleanAttribute }) loading = false;
  @Output() pressed = new EventEmitter<MouseEvent>();
}
