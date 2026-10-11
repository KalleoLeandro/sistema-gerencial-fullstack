import { Component, ContentChild, ElementRef, Input, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

let nextNativeId = 0;

/** Keeps Angular's native value accessors and third-party mask directives on the input itself. */
@Component({
  selector: 'input[aeroControl], textarea[aeroControl], select[aeroControl]',
  standalone: true,
  template: '<ng-content />',
  host: {
    '[class.aero-input]': 'tag === "INPUT"',
    '[class.aero-textarea]': 'tag === "TEXTAREA"',
    '[class.aero-select]': 'tag === "SELECT"',
    '[id]': 'id',
    '[attr.aria-invalid]': 'invalid',
  },
})
export class AeroNativeControlComponent {
  readonly element = inject(ElementRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>);
  readonly control = inject(NgControl, { optional: true, self: true });
  readonly tag = this.element.nativeElement.tagName;
  @Input() id = `aero-native-${++nextNativeId}`;
  get invalid(): boolean { return !!(this.control?.invalid && this.control?.touched); }
}

@Component({
  selector: 'app-aero-field',
  standalone: true,
  template: `<div class="aero-field">
    <label [for]="control?.id"><ng-content select="[aeroLabel]" /></label>
    <ng-content />
    <div [id]="messageId" class="aero-field-messages">
      <ng-content select="[aeroHint]" />
      <div [hidden]="!control?.invalid"><ng-content select="[aeroError]" /></div>
    </div>
  </div>`,
  styles: [':host { display: block; min-width: 0; }'],
})
export class AeroFieldComponent {
  @ContentChild(AeroNativeControlComponent) control?: AeroNativeControlComponent;
  readonly messageId = `aero-messages-${++nextNativeId}`;
  ngAfterContentInit(): void {
    this.control?.element.nativeElement.setAttribute('aria-describedby', this.messageId);
  }
}

/** Native host preserves link semantics, submit, focus, and Bootstrap modal triggers. */
@Component({
  selector: 'button[aeroButton], a[aeroButton]', standalone: true,
  template: '<ng-content />',
  host: {
    class: 'aero-button',
    '[class.aero-button--primary]': 'aeroButton === "primary"',
    '[class.aero-button--success]': 'aeroButton === "success"',
    '[class.aero-button--danger]': 'aeroButton === "danger"',
    '[class.aero-button--quiet]': 'aeroButton === "quiet"',
  },
})
export class AeroNativeButtonComponent {
  @Input() aeroButton: '' | 'primary' | 'secondary' | 'success' | 'danger' | 'quiet' = '';
}
