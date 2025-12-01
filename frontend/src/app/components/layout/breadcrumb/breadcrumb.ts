import { Component, OnInit, inject } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute, RouterModule } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroChevronRight, heroHome } from '@ng-icons/heroicons/outline';

interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumb',
  imports: [RouterModule, NgIconComponent],
  templateUrl: './breadcrumb.html',
  styleUrl: './breadcrumb.css',
  standalone: true,
  viewProviders: [provideIcons({ heroChevronRight, heroHome })]
})
export class BreadcrumbComponent implements OnInit {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  
  breadcrumbs: Breadcrumb[] = [];

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.buildBreadcrumbs(this.activatedRoute.root))
      )
      .subscribe(breadcrumbs => {
        this.breadcrumbs = breadcrumbs;
      });

    // Initial breadcrumb
    this.breadcrumbs = this.buildBreadcrumbs(this.activatedRoute.root);
  }

  private buildBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: Breadcrumb[] = []): Breadcrumb[] {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      const label = child.snapshot.data['breadcrumb'];
      if (label) {
        breadcrumbs.push({ label, url });
      }

      return this.buildBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }
}
