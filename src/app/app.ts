import { Component, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-root',
  imports: [ButtonModule, CardModule, CommonModule, TooltipModule, RippleModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('ogz-kritik');
  protected readonly isDarkMode = signal(false);

  toggleDarkMode() {
    this.isDarkMode.set(!this.isDarkMode());
  }
}
