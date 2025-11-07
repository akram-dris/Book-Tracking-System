import { Component } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  heroMagnifyingGlass, 
  heroSun, 
  heroMoon 
} from '@ng-icons/heroicons/outline';
import { StreakIndicatorComponent } from '../../streak-sidebar/streak-indicator';

@Component({
  selector: 'app-header',
  imports: [NgIconComponent, StreakIndicatorComponent],
  templateUrl: './header.html',
  styleUrl: './header.css',
  standalone: true,
  viewProviders: [
    provideIcons({ 
      heroMagnifyingGlass, 
      heroSun,
      heroMoon
    })
  ]
})
export class HeaderComponent {
  isDarkMode = false;

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.setAttribute(
      'data-theme', 
      this.isDarkMode ? 'dark' : 'light'
    );
  }
}
