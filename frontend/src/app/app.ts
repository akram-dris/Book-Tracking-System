import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { StreakIndicatorComponent } from './components/streak-sidebar/streak-indicator';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, StreakIndicatorComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
  isSidebarCollapsed = false;

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}
