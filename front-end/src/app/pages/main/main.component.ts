import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MainLayoutComponent } from '@components/main-layout/main-layout.component';

@Component({
  selector: 'app-main',
  imports: [CommonModule, MainLayoutComponent],
  standalone: true,
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent {

}
