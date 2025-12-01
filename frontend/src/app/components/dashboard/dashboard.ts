import { Component, OnInit, ChangeDetectionStrategy, inject, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroBookOpen, heroFire, heroChartBar, heroPlus,
  heroClock, heroTrophy, heroArrowTrendingUp, heroSparkles,
  heroCalendar, heroBookmark, heroCheckCircle, heroDocumentText
} from '@ng-icons/heroicons/outline';

import { trigger, transition, style, animate, stagger, query } from '@angular/animations';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { MatButtonModule } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { BookService } from '../../services/book';
import { StatisticService } from '../../services/statistic';
import { StreakService } from '../../services/streak';
import { ReadingSessionService } from '../../services/reading-session';
import { ReadingStatusService } from '../../services/reading-status';
import { GetBook } from '../../models/get-book.model';
import { Streak } from '../../models/streak.model';
import { ReadingStatus } from '../../models/enums/reading-status.enum';
import { Dialog } from '@angular/cdk/dialog';
import { ReadingLogModalComponent } from '../reading-log-modal/reading-log-modal';
import { forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';

interface BookWithStatus extends GetBook {
  statusBadgeClass?: string;
  statusDisplayName?: string;
}

import { EmptyStateComponent } from '../shared/empty-state/empty-state';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgIconComponent, RouterModule, BaseChartDirective, MatButtonModule, EmptyStateComponent],
  viewProviders: [provideIcons({
    heroBookOpen, heroFire, heroChartBar, heroPlus, heroClock,
    heroTrophy, heroArrowTrendingUp, heroSparkles, heroCalendar,
    heroBookmark, heroCheckCircle, heroDocumentText
  })],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);
  stats: any = null;
  streakData: Streak | null = null;
  currentlyReading: BookWithStatus[] = [];
  recentBooks: BookWithStatus[] = [];
  loading = true;
  rootUrl: string = environment.rootUrl;

  // Store book progress (bookId -> progress%)
  bookProgress = new Map<number, number>();

  // Chart data
  readingProgressChart: ChartConfiguration<'doughnut'>['data'] | undefined;
  monthlyActivityChart: ChartConfiguration<'bar'>['data'] | undefined;

  // Chart options
  doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '75%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} books (${percentage}%)`;
          }
        },
        backgroundColor: 'rgba(23, 23, 23, 0.9)', // Darker background
        titleColor: 'rgba(255, 255, 255, 1)',
        bodyColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        titleFont: { size: 14, weight: 'bold', family: "'Outfit', sans-serif" },
        bodyFont: { size: 13, family: "'Inter', sans-serif" },
        padding: 12,
        cornerRadius: 12,
        displayColors: true,
        boxPadding: 6
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1500,
      easing: 'easeInOutCubic',
      delay: (context: any) => {
        return context.dataIndex * 150;
      }
    },
    interaction: {
      mode: 'nearest',
      intersect: false
    }
  };

  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(23, 23, 23, 0.9)',
        titleColor: 'rgba(255, 255, 255, 1)',
        bodyColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        titleFont: { size: 14, weight: 'bold', family: "'Outfit', sans-serif" },
        bodyFont: { size: 13, family: "'Inter', sans-serif" },
        padding: 12,
        cornerRadius: 12,
        displayColors: true,
        boxPadding: 6,
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${value} books (${percentage}%)`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 12,
            weight: 500,
            family: "'Inter', sans-serif"
          },
          color: 'rgba(156, 163, 175, 0.8)',
          padding: 8
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          lineWidth: 1
        },
        border: {
          display: false
        }
      },
      x: {
        ticks: {
          font: {
            size: 12,
            weight: 500,
            family: "'Inter', sans-serif"
          },
          color: 'rgba(156, 163, 175, 0.8)',
          padding: 8
        },
        grid: {
          display: false
        },
        border: {
          display: false
        }
      }
    },
    animation: {
      duration: 1200,
      easing: 'easeOutCubic',
      delay: (context: any) => {
        return context.dataIndex * 150;
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    }
  };

  getTotalBooks(): number {
    if (!this.stats || !this.stats.books || !this.stats.books.booksByStatus) {
      return 0;
    }
    return Object.values(this.stats.books.booksByStatus).reduce((sum: number, count: any) => sum + count, 0);
  }

  constructor(
    private bookService: BookService,
    private statsService: StatisticService,
    private streakService: StreakService,
    private readingSessionService: ReadingSessionService,
    private readingStatusService: ReadingStatusService,
    private router: Router,
    private dialog: Dialog
  ) { }

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
      this.cdr.markForCheck();
    });
  }

  loadStats(): Promise<void> {
    return new Promise((resolve) => {
      this.statsService.getCompleteStatistics()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (result) => {
            if (result.isSuccess && result.data) {
              this.stats = result.data;
              this.prepareCharts();
            } else {

            }
            resolve();
            this.cdr.markForCheck();
            this.cdr.markForCheck();
          },
          error: (err) => {

            resolve();
            this.cdr.markForCheck();
            this.cdr.markForCheck();
          }
        });
    });
  }

  loadStreak(): Promise<void> {
    return new Promise((resolve) => {
      this.streakService.getStreakData()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (result) => {
            if (result.isSuccess && result.data) {
              this.streakData = result.data;
            } else {

            }
            resolve();
            this.cdr.markForCheck();
            this.cdr.markForCheck();
          },
          error: (err) => {

            resolve();
            this.cdr.markForCheck();
            this.cdr.markForCheck();
          }
        });
    });
  }

  loadBooks(): Promise<void> {
    return new Promise((resolve) => {
      this.readingStatusService.getAllStatuses()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (statusResult) => {
            if (!statusResult.isSuccess || !statusResult.data) {

              resolve();
              this.cdr.markForCheck();
              return;
            }

            const statuses = statusResult.data;
            const statusMap = new Map(statuses.map(s => [s.value, s]));

            this.bookService.getBooks()
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: (bookResult) => {
                  if (bookResult.isSuccess && bookResult.data) {
                    const books = bookResult.data;
                    const booksWithStatus = books.map(book => {
                      const statusInfo = statusMap.get(book.status);
                      return {
                        ...book,
                        statusBadgeClass: statusInfo?.badgeClass || 'badge-ghost',
                        statusDisplayName: statusInfo?.displayName || 'Unknown'
                      };
                    });

                    this.currentlyReading = booksWithStatus
                      .filter(b => b.status === ReadingStatus.CurrentlyReading)
                      .slice(0, 3);
                    this.recentBooks = booksWithStatus
                      .sort((a, b) => b.id - a.id)
                      .slice(0, 6);

                    // Load progress for currently reading books
                    if (this.currentlyReading.length > 0) {
                      this.loadBookProgress(this.currentlyReading).then(() => resolve());
                    } else {
                      resolve();
                      this.cdr.markForCheck();
                    }
                  } else {

                    resolve();
                    this.cdr.markForCheck();
                  }
                },
                error: (err) => {

                  resolve();
                  this.cdr.markForCheck();
                }
              });
          },
          error: (err) => {

            resolve();
            this.cdr.markForCheck();
          }
        });
    });
  }

  loadBookProgress(books: BookWithStatus[]): Promise<void> {
    return new Promise((resolve) => {
      const sessionRequests = books.map(book =>
        this.readingSessionService.getReadingSessionsForBook(book.id)
      );

      forkJoin(sessionRequests)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (resultsArray) => {
            books.forEach((book, index) => {
              const result = resultsArray[index];
              if (result.isSuccess && result.data) {
                const sessions = result.data;
                const currentPage = sessions.reduce((sum, session) => sum + session.pagesRead, 0);
                const progress = book.totalPages > 0 ? Math.round((currentPage / book.totalPages) * 100) : 0;
                this.bookProgress.set(book.id, progress);
              } else {

                this.bookProgress.set(book.id, 0);
              }
            });
            resolve();
            this.cdr.markForCheck();
          },
          error: (err) => {

            resolve();
            this.cdr.markForCheck();
          }
        });
    });
  }

  prepareCharts(): void {
    if (!this.stats) return;

    // Doughnut chart for reading status with modern colors
    const booksByStatus = this.stats.books?.booksByStatus || {};
    const toReadChart = (booksByStatus.Planning || 0) + (booksByStatus.NotReading || 0);
    const readingChart = booksByStatus.CurrentlyReading || 0;
    const completedChart = (booksByStatus.Completed || 0) + (booksByStatus.Summarized || 0);

    // Ensure we have at least some dummy data for visualization when no books
    const hasData = toReadChart > 0 || readingChart > 0 || completedChart > 0;

    this.readingProgressChart = {
      labels: ['Planning', 'In Progress', 'Finished'],
      datasets: [{
        data: hasData ? [toReadChart, readingChart, completedChart] : [1, 1, 1],
        backgroundColor: [
          'rgba(255, 20, 147, 0.8)',   // Hot Pink (Planning)
          'rgba(124, 58, 237, 0.8)',   // Electric Violet (In Progress)
          'rgba(0, 255, 255, 0.8)'     // Cyan (Finished)
        ],
        borderColor: [
          'rgba(255, 20, 147, 1)',
          'rgba(124, 58, 237, 1)',
          'rgba(0, 255, 255, 1)'
        ],
        borderWidth: 0,
        hoverBackgroundColor: [
          'rgba(255, 20, 147, 1)',
          'rgba(124, 58, 237, 1)',
          'rgba(0, 255, 255, 1)'
        ],
        hoverBorderColor: [
          'rgba(255, 255, 255, 0.5)',
          'rgba(255, 255, 255, 0.5)',
          'rgba(255, 255, 255, 0.5)'
        ],
        hoverBorderWidth: 2,
        spacing: 4,
        hoverOffset: 10
      }]
    };

    // Bar chart for status breakdown with gradient effect
    this.monthlyActivityChart = {
      labels: ['Planning', 'In Progress', 'Finished'],
      datasets: [{
        label: 'Books',
        data: hasData ? [toReadChart, readingChart, completedChart] : [1, 1, 1],
        backgroundColor: [
          'rgba(255, 20, 147, 0.6)',
          'rgba(124, 58, 237, 0.6)',
          'rgba(0, 255, 255, 0.6)'
        ],
        borderColor: [
          'rgba(255, 20, 147, 1)',
          'rgba(124, 58, 237, 1)',
          'rgba(0, 255, 255, 1)'
        ],
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: [
          'rgba(255, 20, 147, 0.8)',
          'rgba(124, 58, 237, 0.8)',
          'rgba(0, 255, 255, 0.8)'
        ],
        hoverBorderColor: [
          'rgba(255, 255, 255, 0.8)',
          'rgba(255, 255, 255, 0.8)',
          'rgba(255, 255, 255, 0.8)'
        ],
        hoverBorderWidth: 2
      }]
    };
  }

  getReadingProgress(book: BookWithStatus): number {
    return this.bookProgress.get(book.id) || 0;
  }

  getStatusClass(book: BookWithStatus): string {
    return book.statusBadgeClass || 'badge-ghost';
  }

  getStatusLabel(book: BookWithStatus): string {
    return book.statusDisplayName || 'Unknown';
  }

  openLogSession(): void {
    const dialogRef = this.dialog.open(ReadingLogModalComponent, {
      width: '90%',
      maxWidth: '1200px',
      data: {},
      panelClass: 'cdk-overlay-pane',
      backdropClass: 'cdk-overlay-dark-backdrop'
    });

    dialogRef.closed
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result: any) => {
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
