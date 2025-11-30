import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { SidebarComponent } from './components/layout/sidebar/sidebar';
import { HeaderComponent } from './components/layout/header/header';
import { BreadcrumbComponent } from './components/layout/breadcrumb/breadcrumb';
import { ToastContainerComponent } from './components/shared/toast/toast-container/toast-container';
import { trigger, transition, style, animate, query } from '@angular/animations';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterModule,
    SidebarComponent,
    HeaderComponent,
    BreadcrumbComponent,
    ToastContainerComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
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

  constructor(private router: Router) {
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  // Method for route animation trigger
  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }
}


