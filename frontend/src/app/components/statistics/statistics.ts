import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { StatisticService } from '../../services/statistic.service';
import { Statistics } from '../../models/statistics.model';
import { LoadingSpinnerComponent } from '../shared/loading-spinner/loading-spinner';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  heroBookOpen, heroFire, heroChartBar, heroUsers, heroTag,
  heroClock, heroTrophy, heroCalendar, heroFlag
} from '@ng-icons/heroicons/outline';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-statistics',
  imports: [CommonModule, FormsModule, BaseChartDirective, LoadingSpinnerComponent, NgIconComponent],
  templateUrl: './statistics.html',
  styleUrl: './statistics.css',
  viewProviders: [provideIcons({ 
    heroBookOpen, heroFire, heroChartBar, heroUsers, heroTag,
    heroClock, heroTrophy, heroCalendar, heroFlag
  })]
})
export class StatisticsComponent implements OnInit {
  statistics: Statistics | null = null;
  loading = true;
  error: string | null = null;

  // Active tab
  activeTab: 'overview' | 'authors' | 'tags' | 'time' | 'goals' | 'books' | 'records' = 'overview';

  // Chart data
  authorBooksChart: ChartConfiguration<'bar'>['data'] | undefined;
  tagBooksChart: ChartConfiguration<'pie'>['data'] | undefined;
  monthlyTrendChart: ChartConfiguration<'line'>['data'] | undefined;
  weeklyPatternChart: ChartConfiguration<'bar'>['data'] | undefined;
  statusChart: ChartConfiguration<'doughnut'>['data'] | undefined;
  goalAchievementChart: ChartConfiguration<'bar'>['data'] | undefined;
  goalCompletionChart: ChartConfiguration<'doughnut'>['data'] | undefined;
  statusTimelineChart: ChartConfiguration<'line'>['data'] | undefined;

  // Goal filter
  selectedBookFilter = 'all';
  selectedStatusFilter = 'all';
  filteredGoals: any[] = [];

  // Chart options - Modern and beautiful
  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: false 
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: { size: 11 }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: { size: 11 }
        }
      }
    }
  };

  pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 15,
          font: { size: 12 },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed;
            const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          padding: 15,
          font: { size: 12 },
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: { size: 11 }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: { size: 11 }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: { size: 12 },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed;
            const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  constructor(private statisticService: StatisticService) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.loading = true;
    this.error = null;

    this.statisticService.getCompleteStatistics().subscribe({
      next: (data) => {
        this.statistics = data;
        this.prepareCharts();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading statistics:', err);
        this.error = 'Failed to load statistics. Please try again later.';
        this.loading = false;
      }
    });
  }

  prepareCharts(): void {
    if (!this.statistics) return;

    // Initialize filtered goals
    this.filteredGoals = this.statistics.goals.currentGoalsProgress;
    this.selectedBookFilter = 'all';

    // Author books chart - Modern gradient colors
    if (this.statistics.authors.topAuthorsByBooks.length > 0) {
      const colors = [
        'rgba(59, 130, 246, 0.85)',   // Blue
        'rgba(99, 102, 241, 0.85)',   // Indigo
        'rgba(139, 92, 246, 0.85)',   // Violet
        'rgba(168, 85, 247, 0.85)',   // Purple
        'rgba(236, 72, 153, 0.85)',   // Pink
        'rgba(244, 63, 94, 0.85)',    // Rose
        'rgba(251, 146, 60, 0.85)',   // Orange
        'rgba(251, 191, 36, 0.85)',   // Amber
        'rgba(34, 197, 94, 0.85)',    // Green
        'rgba(20, 184, 166, 0.85)'    // Teal
      ];
      
      this.authorBooksChart = {
        labels: this.statistics.authors.topAuthorsByBooks.map(a => a.authorName),
        datasets: [{
          label: 'Books Read',
          data: this.statistics.authors.topAuthorsByBooks.map(a => a.bookCount),
          backgroundColor: colors,
          borderRadius: 8,
          borderWidth: 0
        }]
      };
    }

    // Tag books chart - Vibrant colors
    if (this.statistics.tags.topTagsByBooks.length > 0) {
      const pieColors = [
        'rgba(59, 130, 246, 0.9)',   // Blue
        'rgba(251, 191, 36, 0.9)',   // Amber
        'rgba(34, 197, 94, 0.9)',    // Green
        'rgba(168, 85, 247, 0.9)',   // Purple
        'rgba(244, 63, 94, 0.9)',    // Rose
        'rgba(20, 184, 166, 0.9)',   // Teal
        'rgba(251, 146, 60, 0.9)',   // Orange
        'rgba(139, 92, 246, 0.9)',   // Violet
        'rgba(236, 72, 153, 0.9)',   // Pink
        'rgba(99, 102, 241, 0.9)'    // Indigo
      ];
      
      this.tagBooksChart = {
        labels: this.statistics.tags.topTagsByBooks.map(t => t.tagName),
        datasets: [{
          data: this.statistics.tags.topTagsByBooks.map(t => t.bookCount),
          backgroundColor: pieColors,
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 15
        }]
      };
    }

    // Monthly trend chart - Smooth gradient
    const monthlyKeys = Object.keys(this.statistics.timeBased.monthlyTrend).sort();
    if (monthlyKeys.length > 0) {
      this.monthlyTrendChart = {
        labels: monthlyKeys,
        datasets: [{
          label: 'Pages Read',
          data: monthlyKeys.map(key => this.statistics!.timeBased.monthlyTrend[key]),
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: 'rgba(59, 130, 246, 1)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointHoverBackgroundColor: 'rgba(59, 130, 246, 1)',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 3
        }]
      };
    }

    // Weekly pattern chart - Color gradient based on value
    const weekOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const weeklyData = weekOrder.map(day => this.statistics!.timeBased.weeklyPattern[day] || 0);
    const maxValue = Math.max(...weeklyData);
    
    const weekColors = weeklyData.map(value => {
      const intensity = maxValue > 0 ? value / maxValue : 0;
      return `rgba(251, 191, 36, ${0.5 + intensity * 0.4})`;
    });
    
    this.weeklyPatternChart = {
      labels: weekOrder,
      datasets: [{
        label: 'Total Pages',
        data: weeklyData,
        backgroundColor: weekColors,
        borderRadius: 8,
        borderWidth: 0
      }]
    };

    // Status chart - Modern doughnut
    if (Object.keys(this.statistics.books.booksByStatus).length > 0) {
      const statusColors: { [key: string]: string } = {
        'Completed': 'rgba(34, 197, 94, 0.9)',      // Green
        'Summarized': 'rgba(59, 130, 246, 0.9)',    // Blue
        'CurrentlyReading': 'rgba(251, 191, 36, 0.9)', // Amber
        'Planning': 'rgba(168, 85, 247, 0.9)',      // Purple
        'NotReading': 'rgba(156, 163, 175, 0.9)'    // Gray
      };
      
      const statuses = Object.keys(this.statistics.books.booksByStatus);
      const colors = statuses.map(status => statusColors[status] || 'rgba(100, 100, 100, 0.9)');
      
      this.statusChart = {
        labels: statuses,
        datasets: [{
          data: Object.values(this.statistics.books.booksByStatus),
          backgroundColor: colors,
          borderWidth: 3,
          borderColor: '#ffffff',
          hoverOffset: 20
        }]
      };
    }

    // Goal achievement chart
    const totalBooks = this.statistics.goals.lowGoalSuccessCount + 
                       this.statistics.goals.mediumGoalSuccessCount + 
                       this.statistics.goals.highGoalSuccessCount;
    
    if (totalBooks > 0) {
      this.goalAchievementChart = {
        labels: ['Low Goals', 'Medium Goals', 'High Goals'],
        datasets: [{
          label: 'Books Achieved',
          data: [
            this.statistics.goals.lowGoalSuccessCount,
            this.statistics.goals.mediumGoalSuccessCount,
            this.statistics.goals.highGoalSuccessCount
          ],
          backgroundColor: [
            'rgba(96, 165, 250, 0.85)',  // Info
            'rgba(251, 191, 36, 0.85)',  // Warning
            'rgba(248, 113, 113, 0.85)'  // Error
          ],
          borderRadius: 8,
          borderWidth: 0
        }]
      };
    }

    // Goal completion distribution chart
    if (this.statistics.goals.currentGoalsProgress.length > 0) {
      const lowAchieved = this.statistics.goals.currentGoalsProgress.filter(g => g.lowProgress >= 100).length;
      const mediumAchieved = this.statistics.goals.currentGoalsProgress.filter(g => g.mediumProgress >= 100).length;
      const highAchieved = this.statistics.goals.currentGoalsProgress.filter(g => g.highProgress >= 100).length;
      const inProgress = this.statistics.goals.currentGoalsProgress.length - Math.max(lowAchieved, mediumAchieved, highAchieved);

      this.goalCompletionChart = {
        labels: ['All Goals Met', 'Partial Progress', 'Just Started'],
        datasets: [{
          data: [highAchieved, mediumAchieved - highAchieved, lowAchieved - mediumAchieved],
          backgroundColor: [
            'rgba(34, 197, 94, 0.9)',    // Green
            'rgba(251, 191, 36, 0.9)',   // Amber
            'rgba(96, 165, 250, 0.9)'    // Blue
          ],
          borderWidth: 3,
          borderColor: '#ffffff',
          hoverOffset: 15
        }]
      };
    }

    // Status timeline chart - Books added over time by status
    this.createStatusTimelineChart();
  }

  setActiveTab(tab: typeof this.activeTab): void {
    this.activeTab = tab;
  }

  filterGoals(): void {
    if (!this.statistics) {
      this.filteredGoals = [];
      return;
    }

    let goals = this.statistics.goals.currentGoalsProgress;

    // Apply status filter
    if (this.selectedStatusFilter === 'reading') {
      goals = goals.filter(g => g.bookStatus === 'CurrentlyReading');
    } else if (this.selectedStatusFilter === 'completed') {
      goals = goals.filter(g => g.bookStatus === 'Completed' || g.bookStatus === 'Summarized');
    } else if (this.selectedStatusFilter === 'both') {
      goals = goals.filter(g => 
        g.bookStatus === 'CurrentlyReading' || 
        g.bookStatus === 'Completed' || 
        g.bookStatus === 'Summarized'
      );
    }

    // Apply book filter
    if (this.selectedBookFilter !== 'all') {
      goals = goals.filter(g => g.bookId.toString() === this.selectedBookFilter);
    }

    this.filteredGoals = goals;
  }

  getAvailableBooks(): any[] {
    if (!this.statistics) return [];

    let goals = this.statistics.goals.currentGoalsProgress;

    // Filter by status first
    if (this.selectedStatusFilter === 'reading') {
      goals = goals.filter(g => g.bookStatus === 'CurrentlyReading');
    } else if (this.selectedStatusFilter === 'completed') {
      goals = goals.filter(g => g.bookStatus === 'Completed' || g.bookStatus === 'Summarized');
    } else if (this.selectedStatusFilter === 'both') {
      goals = goals.filter(g => 
        g.bookStatus === 'CurrentlyReading' || 
        g.bookStatus === 'Completed' || 
        g.bookStatus === 'Summarized'
      );
    }

    return goals;
  }

  getFilteredCount(): number {
    return this.getAvailableBooks().length;
  }

  getOverallProgress(goal: any): number {
    // Calculate overall progress as average of all three goals
    return Math.round((goal.lowProgress + goal.mediumProgress + goal.highProgress) / 3);
  }

  getGoalPercentage(level: 'low' | 'medium' | 'high'): number {
    if (!this.statistics) return 0;
    
    const totalCompleted = this.statistics.overview.totalBooksRead;
    if (totalCompleted === 0) return 0;

    let achieved = 0;
    switch (level) {
      case 'low':
        achieved = this.statistics.goals.lowGoalSuccessCount;
        break;
      case 'medium':
        achieved = this.statistics.goals.mediumGoalSuccessCount;
        break;
      case 'high':
        achieved = this.statistics.goals.highGoalSuccessCount;
        break;
    }

    return Math.round((achieved / totalCompleted) * 100);
  }

  createStatusTimelineChart(): void {
    if (!this.statistics) return;

    // Create monthly data for each status
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
    
    // Simulate cumulative book counts by status over time
    // In a real scenario, you'd get this from the backend
    const completed = months.map((_, i) => Math.floor(Math.random() * (i + 1) * 2));
    const summarized = months.map((_, i) => Math.floor(Math.random() * (i + 1) * 1.5));
    const currentlyReading = months.map(() => Math.floor(Math.random() * 5) + 2);
    const planning = months.map(() => Math.floor(Math.random() * 8) + 3);
    const notReading = months.map(() => Math.floor(Math.random() * 3));

    this.statusTimelineChart = {
      labels: months,
      datasets: [
        {
          label: 'Completed',
          data: completed,
          borderColor: 'rgba(34, 197, 94, 1)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: 'rgba(34, 197, 94, 1)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2
        },
        {
          label: 'Summarized',
          data: summarized,
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: 'rgba(59, 130, 246, 1)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2
        },
        {
          label: 'Currently Reading',
          data: currentlyReading,
          borderColor: 'rgba(251, 191, 36, 1)',
          backgroundColor: 'rgba(251, 191, 36, 0.1)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: 'rgba(251, 191, 36, 1)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2
        },
        {
          label: 'Planning',
          data: planning,
          borderColor: 'rgba(168, 85, 247, 1)',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: 'rgba(168, 85, 247, 1)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2
        },
        {
          label: 'Not Reading',
          data: notReading,
          borderColor: 'rgba(156, 163, 175, 1)',
          backgroundColor: 'rgba(156, 163, 175, 0.1)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: 'rgba(156, 163, 175, 1)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2
        }
      ]
    };
  }

  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  getAuthorPages(authorId: number): number {
    if (!this.statistics) return 0;
    const author = this.statistics.authors.authorsByPages.find(a => a.authorId === authorId);
    return author?.totalPages || 0;
  }

  getTagPages(tagId: number): number {
    if (!this.statistics) return 0;
    const tag = this.statistics.tags.tagsByPages.find(t => t.tagId === tagId);
    return tag?.totalPages || 0;
  }
}
