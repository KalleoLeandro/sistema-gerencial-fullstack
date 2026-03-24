import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ToastService } from '@services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css'
})
export class ToastComponent {
  public readonly toastService = inject(ToastService);

  public dismiss(id: number): void {
    this.toastService.dismiss(id);
  }
}
