import { Component, input, output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  heroBookOpen, 
  heroUserGroup, 
  heroTag, 
  heroCalendarDays,
  heroBars3,
  heroChartBarSquare
} from '@ng-icons/heroicons/outline';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  tooltip?: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule, NgIconComponent],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  standalone: true,
  viewProviders: [
    provideIcons({ 
      heroBookOpen, 
      heroUserGroup, 
      heroTag, 
      heroCalendarDays,
      heroBars3,
      heroChartBarSquare
    })
  ]
})
export class SidebarComponent {
  isCollapsed = input<boolean>(false);
  toggleCollapse = output<void>();

  navItems: NavItem[] = [
    { path: '/books', label: 'Books', icon: 'heroBookOpen', tooltip: 'Manage your books' },
    { path: '/authors', label: 'Authors', icon: 'heroUserGroup', tooltip: 'Manage authors' },
    { path: '/tags', label: 'Tags', icon: 'heroTag', tooltip: 'Organize with tags' },
    { path: '/heatmap', label: 'Heatmap', icon: 'heroChartBarSquare', tooltip: 'Reading activity' }
  ];

  onToggle(): void {
    this.toggleCollapse.emit();
  }
}
