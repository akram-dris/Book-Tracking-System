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
import { ReadingStatusService } from '../../services/reading-status';
import { GetBook } from '../../models/get-book.model';
import { Streak } from '../../models/streak.model';
import { ReadingStatus } from '../../models/enums/reading-status.enum';
import { Dialog } from '@angular/cdk/dialog';
import { ReadingLogModalComponent } from '../reading-log-modal/reading-log-modal.component';
import { forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';

interface BookWithStatus extends GetBook {
  statusBadgeClass?: string;
  statusDisplayName?: string;
}

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
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: {
          padding: 20,
          font: {
            size: 14,
            weight: 600,
            family: "'Inter', sans-serif"
          },
          color: 'rgba(255, 255, 255, 0.95)',
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 12,
          boxHeight: 12,
          generateLabels: (chart: any) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const value = data.datasets[0].data[i];
                const total = data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                return {
                  text: `${label}: ${value} (${percentage}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: data.datasets[0].borderColor[i],
                  lineWidth: 2,
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        }
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
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: 'rgba(255, 255, 255, 1)',
        bodyColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: 'rgba(75, 85, 99, 0.5)',
        borderWidth: 1,
        titleFont: { size: 15, weight: 'bold', family: "'Inter', sans-serif" },
        bodyFont: { size: 14, family: "'Inter', sans-serif" },
        padding: 16,
        cornerRadius: 12,
        displayColors: true,
        boxPadding: 8
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 2000,
      easing: 'easeInOutCubic',
      delay: (context: any) => {
        return context.dataIndex * 200;
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
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: 'rgba(255, 255, 255, 1)',
        bodyColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: 'rgba(75, 85, 99, 0.5)',
        borderWidth: 1,
        titleFont: { size: 15, weight: 'bold', family: "'Inter', sans-serif" },
        bodyFont: { size: 14, family: "'Inter', sans-serif" },
        padding: 16,
        cornerRadius: 12,
        displayColors: true,
        boxPadding: 8,
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
            size: 13,
            weight: 500,
            family: "'Inter', sans-serif"
          },
          color: 'rgba(255, 255, 255, 0.8)',
          padding: 8
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.08)',
          lineWidth: 1
        },
        border: {
          display: false
        }
      },
      x: {
        ticks: {
          font: { 
            size: 13,
            weight: 500,
            family: "'Inter', sans-serif"
          },
          color: 'rgba(255, 255, 255, 0.8)',
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
      duration: 2000,
      easing: 'easeInOutCubic',
      delay: (context: any) => {
        return context.dataIndex * 300;
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    }
  };

  constructor(
    private bookService: BookService,
    private statsService: StatisticService,
    private streakService: StreakService,
    private readingSessionService: ReadingSessionService,
    private readingStatusService: ReadingStatusService,
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
      this.readingStatusService.getAllStatuses().subscribe({
        next: (statuses) => {
          const statusMap = new Map(statuses.map(s => [s.value, s]));
          
          this.bookService.getBooks().subscribe({
            next: (books) => {
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
              }
            },
            error: (err) => {
              console.error('Error loading books', err);
              resolve();
            }
          });
        },
        error: (err) => {
          console.error('Error loading status info', err);
          resolve();
        }
      });
    });
  }

  loadBookProgress(books: BookWithStatus[]): Promise<void> {
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

    // Doughnut chart for reading status with modern colors
    const bookStats = this.stats.bookStatistics || {};
    const toRead = bookStats.toReadBooksCount || 0;
    const reading = bookStats.currentlyReadingCount || 0;
    const completed = bookStats.completedBooksCount || 0;

    // Ensure we have at least some dummy data for visualization when no books
    const hasData = toRead > 0 || reading > 0 || completed > 0;
    
    this.readingProgressChart = {
      labels: ['📚 Planning', '📖 In Progress', '✅ Finished'],
      datasets: [{
        data: hasData ? [toRead, reading, completed] : [1, 1, 1],
        backgroundColor: [
          'rgba(96, 165, 250, 0.9)',   // Blue - brighter
          'rgba(251, 191, 36, 0.9)',   // Amber - brighter
          'rgba(52, 211, 153, 0.9)'    // Green - brighter
        ],
        borderColor: [
          'rgba(96, 165, 250, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(52, 211, 153, 1)'
        ],
        borderWidth: 3,
        hoverBackgroundColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(16, 185, 129, 1)'
        ],
        hoverBorderColor: [
          'rgba(147, 197, 253, 1)',
          'rgba(252, 211, 77, 1)',
          'rgba(110, 231, 183, 1)'
        ],
        hoverBorderWidth: 5,
        spacing: 3,
        hoverOffset: 15
      }]
    };

    // Bar chart for status breakdown with gradient effect
    this.monthlyActivityChart = {
      labels: ['Planning', 'In Progress', 'Finished'],
      datasets: [{
        label: 'Books',
        data: hasData ? [toRead, reading, completed] : [1, 1, 1],
        backgroundColor: [
          'rgba(96, 165, 250, 0.9)',
          'rgba(251, 191, 36, 0.9)',
          'rgba(52, 211, 153, 0.9)'
        ],
        borderColor: [
          'rgba(96, 165, 250, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(52, 211, 153, 1)'
        ],
        borderWidth: 2,
        borderRadius: 12,
        borderSkipped: false,
        hoverBackgroundColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(16, 185, 129, 1)'
        ],
        hoverBorderColor: [
          'rgba(147, 197, 253, 1)',
          'rgba(252, 211, 77, 1)',
          'rgba(110, 231, 183, 1)'
        ],
        hoverBorderWidth: 3
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
