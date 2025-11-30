import { Component, input, output, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { Subscription } from 'rxjs';
import {
  heroHome,
  heroBookOpen,
  heroUserGroup,
  heroTag,
  heroCalendarDays,
  heroBars3,
  heroBars3BottomLeft,
  heroChartBarSquare,
  heroChartBar,
  heroSparkles
} from '@ng-icons/heroicons/outline';

import { ReadingSessionService } from '../../../services/reading-session';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  tooltip?: string;
  exactMatch?: boolean;
  disabled?: boolean;
}

import { NotificationService } from '../../../services/notification';

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
      heroBars3BottomLeft,
      heroChartBarSquare,
      heroChartBar,
      heroSparkles
    })
  ]
})
export class SidebarComponent implements OnDestroy {
  isCollapsed = input<boolean>(false);
  toggleCollapse = output<void>();

  navItems: NavItem[] = [
    { path: '/', label: 'Dashboard', icon: 'heroHome', tooltip: 'Home Dashboard', exactMatch: true },
    { path: '/books', label: 'Books', icon: 'heroBookOpen', tooltip: 'Manage your books' },
    { path: '/authors', label: 'Authors', icon: 'heroUserGroup', tooltip: 'Manage authors' },
    { path: '/tags', label: 'Tags', icon: 'heroTag', tooltip: 'Organize with tags' },
    { path: '/statistics', label: 'Statistics', icon: 'heroChartBar', tooltip: 'Analytics & Stats', disabled: true },
    { path: '/recommendations', label: 'Recommendations', icon: 'heroSparkles', tooltip: 'Recommended books', disabled: true },
    { path: '/heatmap', label: 'Heatmap', icon: 'heroChartBarSquare', tooltip: 'Reading activity', disabled: true }
  ];

  private sessionChangeSubscription?: Subscription;

  constructor(
    private readingSessionService: ReadingSessionService,
    private notificationService: NotificationService
  ) {
    // Check sessions on initialization
    this.checkSessions();

    // Subscribe to session changes and re-check when sessions are added/deleted
    this.sessionChangeSubscription = this.readingSessionService.sessionChanged$.subscribe(() => {
      this.checkSessions();
    });
  }

  ngOnDestroy(): void {
    // Clean up subscription
    if (this.sessionChangeSubscription) {
      this.sessionChangeSubscription.unsubscribe();
    }
  }

  checkSessions() {
    this.readingSessionService.hasAnySessions().subscribe(result => {
      if (result.isSuccess && result.data) {
        this.enableSessionDependentItems();
      }
    });
  }

  enableSessionDependentItems() {
    this.navItems = this.navItems.map(item => {
      if (['/statistics', '/recommendations', '/heatmap'].includes(item.path)) {
        return { ...item, disabled: false };
      }
      return item;
    });
  }

  handleItemClick(item: NavItem, event: Event): void {
    if (item.disabled) {
      event.preventDefault();
      event.stopPropagation();
      this.notificationService.showInfo('Add your first reading session to unlock this feature.', 'Feature Locked');
    }
  }

  onToggle(): void {
    this.toggleCollapse.emit();
  }
}
