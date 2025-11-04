import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  heroBookOpen, heroFire, heroChartBar, heroPlus, 
  heroClock, heroTrophy, heroArrowTrendingUp, heroSparkles,
  heroCalendar, heroBookmark, heroCheckCircle
} from '@ng-icons/heroicons/outline';
import { trigger, transition, style, animate, stagger, query } from '@angular/animations';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

import { BookService } from '../../services/book.service';
import { StatisticService } from '../../services/statistic.service';
import { StreakService } from '../../services/streak.service';
import { ReadingSessionService } from '../../services/reading-session.service';
import { GetBook } from '../../models/get-book.model';
import { Streak } from '../../models/streak.model';
import { ReadingStatus } from '../../models/enums/reading-status.enum';
import { Dialog } from '@angular/cdk/dialog';
import { ReadingLogModalComponent } from '../reading-log-modal/reading-log-modal.component';
import { forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgIconComponent, RouterModule, BaseChartDirective],
  viewProviders: [provideIcons({ 
    heroBookOpen, heroFire, heroChartBar, heroPlus, heroClock, 
    heroTrophy, heroArrowTrendingUp, heroSparkles, heroCalendar,
    heroBookmark, heroCheckCircle
  })],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerCards', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class Dashboard implements OnInit {
  stats: any = null;
  streakData: Streak | null = null;
  currentlyReading: GetBook[] = [];
  recentBooks: GetBook[] = [];
  loading = true;
  rootUrl: string = environment.rootUrl;
  
  // Store book progress (bookId -> progress%)
  bookProgress = new Map<number, number>();
  
  // Chart data
  readingProgressChart: ChartConfiguration<'doughnut'>['data'] | null = null;
  monthlyActivityChart: ChartConfiguration<'bar'>['data'] | null = null;

  // Chart options
  doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: true, position: 'bottom' }
    }
  };

  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  constructor(
    private bookService: BookService,
    private statsService: StatisticService,
    private streakService: StreakService,
    private readingSessionService: ReadingSessionService,
    private router: Router,
    private dialog: Dialog
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;

    // Load all data in parallel
    Promise.all([
      this.loadStats(),
      this.loadStreak(),
      this.loadBooks()
    ]).finally(() => {
      this.loading = false;
    });
  }

  loadStats(): Promise<void> {
    return new Promise((resolve) => {
      this.statsService.getGlobalStats().subscribe({
        next: (data) => {
          this.stats = data;
          this.prepareCharts();
          resolve();
        },
        error: (err) => {
          console.error('Error loading stats', err);
          // Calculate stats from books data instead
          this.bookService.getBooks().subscribe({
            next: (books) => {
              this.stats = {
                bookStatistics: {
                  totalBooks: books.length,
                  completedBooksCount: books.filter(b => b.status === ReadingStatus.Completed || b.status === ReadingStatus.Summarized).length,
                  currentlyReadingCount: books.filter(b => b.status === ReadingStatus.CurrentlyReading).length,
                  toReadBooksCount: books.filter(b => b.status === ReadingStatus.Planning || b.status === ReadingStatus.NotReading).length
                },
                totalPagesRead: 0
              };
              this.prepareCharts();
              resolve();
            },
            error: () => resolve()
          });
        }
      });
    });
  }

  loadStreak(): Promise<void> {
    return new Promise((resolve) => {
      this.streakService.getStreakData().subscribe({
        next: (data) => {
          this.streakData = data;
          resolve();
        },
        error: (err) => {
          console.error('Error loading streak', err);
          resolve();
        }
      });
    });
  }

  loadBooks(): Promise<void> {
    return new Promise((resolve) => {
      this.bookService.getBooks().subscribe({
        next: (books) => {
          this.currentlyReading = books
            .filter(b => b.status === ReadingStatus.CurrentlyReading)
            .slice(0, 3);
          this.recentBooks = books
            .sort((a, b) => b.id - a.id)
            .slice(0, 6);
          
          // Load progress for currently reading books
          if (this.currentlyReading.length > 0) {
            this.loadBookProgress(this.currentlyReading).then(() => resolve());
          } else {
            resolve();
          }
        },
        error: (err) => {
          console.error('Error loading books', err);
          resolve();
        }
      });
    });
  }

  loadBookProgress(books: GetBook[]): Promise<void> {
    return new Promise((resolve) => {
      const sessionRequests = books.map(book => 
        this.readingSessionService.getReadingSessionsForBook(book.id)
      );

      forkJoin(sessionRequests).subscribe({
        next: (sessionsArray) => {
          books.forEach((book, index) => {
            const sessions = sessionsArray[index];
            const currentPage = sessions.reduce((sum, session) => sum + session.pagesRead, 0);
            const progress = book.totalPages > 0 ? Math.round((currentPage / book.totalPages) * 100) : 0;
            this.bookProgress.set(book.id, progress);
          });
          resolve();
        },
        error: (err) => {
          console.error('Error loading book progress', err);
          resolve();
        }
      });
    });
  }

  prepareCharts(): void {
    if (!this.stats) return;

    // Doughnut chart for reading status
    const bookStats = this.stats.bookStatistics || {};
    this.readingProgressChart = {
      labels: ['To Read', 'Reading', 'Completed'],
      datasets: [{
        data: [
          bookStats.toReadBooksCount || 0,
          bookStats.currentlyReadingCount || 0,
          bookStats.completedBooksCount || 0
        ],
        backgroundColor: ['#60a5fa', '#fbbf24', '#34d399'],
        hoverBackgroundColor: ['#3b82f6', '#f59e0b', '#10b981']
      }]
    };

    // Bar chart for monthly activity (mock data for now)
    this.monthlyActivityChart = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Books Read',
        data: [3, 5, 2, 8, 6, 4],
        backgroundColor: '#8b5cf6',
        hoverBackgroundColor: '#7c3aed'
      }]
    };
  }

  getReadingProgress(book: GetBook): number {
    return this.bookProgress.get(book.id) || 0;
  }

  getStatusClass(status: ReadingStatus): string {
    switch (status) {
      case ReadingStatus.Planning: return 'badge-info';
      case ReadingStatus.CurrentlyReading: return 'badge-warning';
      case ReadingStatus.Completed: return 'badge-success';
      case ReadingStatus.Summarized: return 'badge-accent';
      default: return 'badge-ghost';
    }
  }

  getStatusLabel(status: ReadingStatus): string {
    switch (status) {
      case ReadingStatus.Planning: return 'Planning';
      case ReadingStatus.CurrentlyReading: return 'Reading';
      case ReadingStatus.Completed: return 'Completed';
      case ReadingStatus.Summarized: return 'Summarized';
      default: return 'Not Reading';
    }
  }

  openLogSession(): void {
    const dialogRef = this.dialog.open(ReadingLogModalComponent, {
      width: '90%',
      maxWidth: '1200px',
      data: {},
      panelClass: 'cdk-overlay-pane',
      backdropClass: 'cdk-overlay-dark-backdrop'
    });

    dialogRef.closed.subscribe((result: any) => {
      if (result) {
        this.loadDashboardData();
      }
    });
  }

  navigateToBooks(): void {
    this.router.navigate(['/books']);
  }

  navigateToBookDetails(bookId: number): void {
    this.router.navigate(['/books', bookId]);
  }

  navigateToAddBook(): void {
    this.router.navigate(['/books/new']);
  }

  navigateToHeatmap(): void {
    this.router.navigate(['/heatmap']);
  }
}
