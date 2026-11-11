import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-form-submit-loader',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './form-submit-loader.component.html',
  styleUrl: './form-submit-loader.component.css'
})
export class FormSubmitLoaderComponent {
  public readonly loading = input(false);
  public readonly message = input('Salvando dados...');
}
