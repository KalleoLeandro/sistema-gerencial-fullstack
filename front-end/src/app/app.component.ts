import { Component, inject } from '@angular/core';
import { ThemeService } from '@services/theme.service';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from '@components/toast/toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private readonly theme = inject(ThemeService);
  title = 'front-end';
}
