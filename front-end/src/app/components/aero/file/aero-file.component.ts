import { Component, EventEmitter, Input, Output, booleanAttribute } from '@angular/core';

let nextFileId = 0;

@Component({
  selector: 'app-aero-file',
  standalone: true,
  template: `<div class="aero-field"><label [for]="controlId">{{ label }}</label>
    <input class="aero-input" type="file" [id]="controlId" [accept]="accept" [multiple]="multiple"
      [disabled]="disabled" [attr.aria-describedby]="hint ? controlId + '-hint' : null" (change)="selectFiles($event)">
    @if (hint) { <small [id]="controlId + '-hint'">{{ hint }}</small> }
  </div>`,
  styles: [':host { display: block; min-width: 0; }'],
})
export class AeroFileComponent {
  @Input() controlId = `aero-file-${++nextFileId}`;
  @Input() label = 'Anexo';
  @Input() hint = '';
  @Input() accept = '';
  @Input({ transform: booleanAttribute }) multiple = false;
  @Input({ transform: booleanAttribute }) disabled = false;
  @Output() filesSelected = new EventEmitter<File[]>();
  protected selectFiles(event: Event): void {
    this.filesSelected.emit(Array.from((event.target as HTMLInputElement).files ?? []));
  }
}
