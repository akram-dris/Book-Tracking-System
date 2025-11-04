import { Component, output } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  heroMagnifyingGlass, 
  heroPlus, 
  heroSun, 
  heroMoon 
} from '@ng-icons/heroicons/outline';
import { ButtonComponent } from '../../shared/button/button';
import { StreakIndicatorComponent } from '../../streak-sidebar/streak-indicator';

@Component({
  selector: 'app-header',
  imports: [NgIconComponent, ButtonComponent, StreakIndicatorComponent],
  templateUrl: './header.html',
  styleUrl: './header.css',
  standalone: true,
  viewProviders: [
    provideIcons({ 
      heroMagnifyingGlass, 
      heroPlus, 
      heroSun,
      heroMoon
    })
  ]
})
export class HeaderComponent {
  addBook = output<void>();
  isDarkMode = false;

  onAddBook(): void {
    this.addBook.emit();
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.setAttribute(
      'data-theme', 
      this.isDarkMode ? 'dark' : 'light'
    );
  }
}
