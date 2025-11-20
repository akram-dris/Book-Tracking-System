import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { SidebarComponent } from './components/layout/sidebar/sidebar';
import { HeaderComponent } from './components/layout/header/header';
import { BreadcrumbComponent } from './components/layout/breadcrumb/breadcrumb';
import { filter } from 'rxjs/operators';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroPlus } from '@ng-icons/heroicons/outline';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    RouterModule, 
    SidebarComponent,
    HeaderComponent,
    BreadcrumbComponent,
    NgIconComponent, // Add NgIconComponent here
    MatButtonModule // Add MatButtonModule here for mat-fab
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  viewProviders: [provideIcons({ heroPlus })] // Provide the heroPlus icon
})
export class App {
  protected readonly title = signal('frontend');
  isSidebarCollapsed = false;
  showAddButton: boolean = false;
  addRouterLink: string = '';

  constructor(private router: Router) {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Show button only on exact list pages
      if (event.url === '/authors') {
        this.showAddButton = true;
        this.addRouterLink = '/authors/new';
      } else if (event.url === '/books') {
        this.showAddButton = true;
        this.addRouterLink = '/books/new';
      } else {
        this.showAddButton = false;
        this.addRouterLink = '';
      }
    });
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  onAddBook() {
    // This method is no longer directly used for navigation as the button uses routerLink
    console.log('Add button clicked, navigation handled by routerLink');
  }
}


