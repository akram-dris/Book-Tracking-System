import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { SidebarComponent } from './components/layout/sidebar/sidebar';
import { HeaderComponent } from './components/layout/header/header';
import { BreadcrumbComponent } from './components/layout/breadcrumb/breadcrumb';
import { filter } from 'rxjs/operators';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroPlus } from '@ng-icons/heroicons/outline';
import { MatButtonModule } from '@angular/material/button';
import { trigger, transition, style, animate, query } from '@angular/animations';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterModule,
    SidebarComponent,
    HeaderComponent,
    BreadcrumbComponent,
    NgIconComponent,
    MatButtonModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  viewProviders: [provideIcons({ heroPlus })],
  animations: [
    trigger('routeAnimations', [
      transition('* <=> *', [
        query(':enter', [
          style({
            opacity: 0
          })
        ], { optional: true }),
        query(':leave', [
          animate('40ms ease-out', style({
            opacity: 0
          }))
        ], { optional: true }),
        query(':enter', [
          animate('80ms ease-out', style({
            opacity: 1
          }))
        ], { optional: true })
      ])
    ])
  ]
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
    console.log('Add button clicked, navigation handled by routerLink');
  }

  // Method for route animation trigger
  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }
}


