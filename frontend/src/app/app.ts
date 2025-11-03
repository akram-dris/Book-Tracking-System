import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { SidebarComponent } from './components/layout/sidebar/sidebar';
import { HeaderComponent } from './components/layout/header/header';
import { BreadcrumbComponent } from './components/layout/breadcrumb/breadcrumb';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    RouterModule, 
    SidebarComponent,
    HeaderComponent,
    BreadcrumbComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
  isSidebarCollapsed = false;

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  onAddBook() {
    // TODO: Navigate to add book page or open dialog
    console.log('Add book clicked');
  }
}
