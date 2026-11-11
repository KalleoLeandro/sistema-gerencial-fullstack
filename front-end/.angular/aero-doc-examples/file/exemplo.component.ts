import { Component } from '@angular/core';
import { AeroFileComponent } from '@components/aero';

@Component({
  selector: 'app-exemplo',
  standalone: true,
  imports: [AeroFileComponent],
  templateUrl: './exemplo.component.html',
})
export class ExemploComponent {
  files: File[] = [];

  onFiles(files: File[]): void {
    this.files = files;
  }
}
