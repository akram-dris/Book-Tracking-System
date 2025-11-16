import { Component, input, output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  heroHome,
  heroBookOpen, 
  heroUserGroup, 
  heroTag, 
  heroCalendarDays,
  heroBars3,
  heroChartBarSquare,
  heroChartBar
} from '@ng-icons/heroicons/outline';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  tooltip?: string;
  exactMatch?: boolean;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule, NgIconComponent],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  standalone: true,
  viewProviders: [
    provideIcons({ 
      heroHome,
      heroBookOpen, 
      heroUserGroup, 
      heroTag, 
      heroCalendarDays,
      heroBars3,
      heroChartBarSquare,
      heroChartBar
    })
  ]
})
export class SidebarComponent {
  isCollapsed = input<boolean>(false);
  toggleCollapse = output<void>();

  navItems: NavItem[] = [
    { path: '/', label: 'Dashboard', icon: 'heroHome', tooltip: 'Home Dashboard', exactMatch: true },
    { path: '/books', label: 'Books', icon: 'heroBookOpen', tooltip: 'Manage your books' },
    { path: '/authors', label: 'Authors', icon: 'heroUserGroup', tooltip: 'Manage authors' },
    { path: '/tags', label: 'Tags', icon: 'heroTag', tooltip: 'Organize with tags' },
    { path: '/statistics', label: 'Statistics', icon: 'heroChartBar', tooltip: 'Analytics & Stats' },
    { path: '/heatmap', label: 'Heatmap', icon: 'heroChartBarSquare', tooltip: 'Reading activity' }
  ];

  onToggle(): void {
    this.toggleCollapse.emit();
  }
}
