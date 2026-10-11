import { Component } from '@angular/core';
import { AeroThemeToggleComponent } from '@components/aero/theme-toggle/aero-theme-toggle.component';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AERO_USAGE_DOCS } from '@pages/design-system/docs/aero-usage.data';

@Component({
  selector: 'app-design-system-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, AeroThemeToggleComponent],
  templateUrl: './design-system-layout.component.html',
  styleUrl: './design-system-layout.component.css',
})
export class DesignSystemLayoutComponent {
  protected readonly components = AERO_USAGE_DOCS;
}
