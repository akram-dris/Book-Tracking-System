import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';

import { AuthorDetailsComponent } from './components/author-details/author-details';
import { BookDetailsComponent } from './components/book-details/book-details';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, BookDetailsComponent, AuthorDetailsComponent],
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
