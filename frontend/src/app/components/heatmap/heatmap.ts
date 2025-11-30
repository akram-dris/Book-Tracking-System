import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate, stagger, query } from '@angular/animations';
import { HeatmapService } from '../../services/heatmap';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroChevronLeft,
  heroChevronRight,
  heroCalendarDays,
  heroCalendar,
  heroFire,
  heroBookOpen,
  heroChartBarSquare,
  heroTrophy,
  heroSparkles,
  heroMinus,
  heroPlus,
  heroChevronDown,
  heroCheck
} from '@ng-icons/heroicons/outline';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

interface CalendarDay {
  date: Date;
  pagesRead: number;
  dayOfMonth: number;
  isCurrentMonth: boolean;
}

interface CalendarWeek {
  days: CalendarDay[];
}

interface CalendarMonth {
  monthName: string;
  weeks: CalendarWeek[];
}

interface LegendItem {
  label: string;
  className: string;
  range: string;
}

import { EmptyStateComponent } from '../shared/empty-state/empty-state';

@Component({
  selector: 'app-heatmap',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent, NgxSkeletonLoaderModule, EmptyStateComponent],
  viewProviders: [provideIcons({
    heroChevronLeft,
    heroChevronRight,
    heroCalendarDays,
    heroCalendar,
    heroFire,
    heroBookOpen,
    heroChartBarSquare,
    heroTrophy,
    heroSparkles,
    heroMinus,
    heroPlus,
    heroChevronDown,
    heroCheck
  })],
  templateUrl: './heatmap.html',
  styleUrl: './heatmap.css',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerFade', [
      transition(':enter', [
        query('.month-container', [
          style({ opacity: 0, transform: 'scale(0.95)' }),
          stagger(50, [
            animate('400ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class HeatmapComponent implements OnInit {
  currentYear: number = new Date().getFullYear();
  years: number[] = [];
  heatmapData: { [key: string]: number } = {};
  calendarMonths: CalendarMonth[] = [];
  loading: boolean = false;
  totalPages: number = 0;
  totalDays: number = 0;
  currentStreak: number = 0;
  longestStreak: number = 0;
  hoveredMonth: number | null = null;
  isYearDropdownOpen: boolean = false;
  legendItems: LegendItem[] = [
    { label: 'No activity', className: 'day-0', range: '0 pages' },
    { label: 'Light', className: 'day-low', range: '1-15 pages' },
    { label: 'Moderate', className: 'day-medium', range: '16-49 pages' },
    { label: 'High', className: 'day-high', range: '50+ pages' }
  ];

  constructor(
    private heatmapService: HeatmapService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadAvailableYears();
  }

  navigateToBooks(): void {
    this.router.navigate(['/books']);
  }

  setHoveredMonth(index: number): void {
    this.hoveredMonth = index;
  }

  clearHoveredMonth(): void {
    this.hoveredMonth = null;
  }

  loadAvailableYears(): void {
    this.heatmapService.getAvailableYears().subscribe({
      next: (result) => {
        if (result.isSuccess && result.data) {
          const { minYear, maxYear } = result.data;
          this.generateYearsFromRange(minYear, maxYear);
          this.loadHeatmapData();
        } else {
          // Fallback to default range if backend doesn't return years
          const currentYear = new Date().getFullYear();
          this.generateYearsFromRange(currentYear - 5, currentYear);
          this.loadHeatmapData();
        }
      },
      error: () => {
        // Fallback to default range on error
        const currentYear = new Date().getFullYear();
        this.generateYearsFromRange(currentYear - 5, currentYear);
        this.loadHeatmapData();
      }
    });
  }

  generateYearsFromRange(minYear: number, maxYear: number): void {
    this.years = [];
    for (let i = minYear; i <= maxYear; i++) {
      this.years.push(i);
    }
  }

  toggleYearDropdown(): void {
    this.isYearDropdownOpen = !this.isYearDropdownOpen;
  }

  selectYear(year: number): void {
    this.currentYear = year;
    this.isYearDropdownOpen = false;
    this.loadHeatmapData();
  }

  loadHeatmapData(): void {
    this.loading = true;
    this.heatmapService.getHeatmapData(this.currentYear).subscribe({
      next: (result) => {
        if (result.isSuccess && result.data) {
          this.heatmapData = result.data;
          this.calculateStats();
          this.calculateStreaks();
          this.generateCalendarGrid();
          this.loading = false;
        } else {
          console.error('Error fetching heatmap data', result.errors);
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error fetching heatmap data', err);
        this.loading = false;
      },
    });
  }

  calculateStats(): void {
    this.totalPages = Object.values(this.heatmapData).reduce((sum, pages) => sum + pages, 0);
    this.totalDays = Object.values(this.heatmapData).filter(pages => pages > 0).length;
  }

  calculateStreaks(): void {
    const sortedDates = Object.keys(this.heatmapData)
      .filter(date => this.heatmapData[date] > 0)
      .sort();

    if (sortedDates.length === 0) {
      this.currentStreak = 0;
      this.longestStreak = 0;
      return;
    }

    let current = 1;
    let longest = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate longest streak
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        current++;
        longest = Math.max(longest, current);
      } else {
        current = 1;
      }
    }

    this.longestStreak = longest;

    // Calculate current streak (counting backwards from today)
    current = 0;
    const lastDate = new Date(sortedDates[sortedDates.length - 1]);
    lastDate.setHours(0, 0, 0, 0);

    if (lastDate.getTime() === today.getTime()) {
      current = 1;
      for (let i = sortedDates.length - 2; i >= 0; i--) {
        const currDate = new Date(sortedDates[i]);
        const nextDate = new Date(sortedDates[i + 1]);
        const diffDays = Math.floor((nextDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          current++;
        } else {
          break;
        }
      }
    }

    this.currentStreak = current;
  }

  generateCalendarGrid(): void {
    this.calendarMonths = [];
    const today = new Date();

    for (let month = 0; month < 12; month++) {
      const monthName = new Date(this.currentYear, month, 1).toLocaleString('default', { month: 'short' });
      const weeks: CalendarWeek[] = [];
      let currentWeek: CalendarDay[] = [];

      const firstDayOfMonth = new Date(this.currentYear, month, 1);
      const startingDayOfWeek = firstDayOfMonth.getDay();

      for (let i = 0; i < startingDayOfWeek; i++) {
        currentWeek.push({
          date: new Date(this.currentYear, month, 1 - (startingDayOfWeek - i)),
          pagesRead: 0,
          dayOfMonth: 0,
          isCurrentMonth: false,
        });
      }

      const daysInMonth = new Date(this.currentYear, month + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(this.currentYear, month, day);
        const monthString = (month + 1).toString().padStart(2, '0');
        const dayString = day.toString().padStart(2, '0');
        const dateString = `${this.currentYear}-${monthString}-${dayString}`;
        const pagesRead = this.heatmapData[dateString] || 0;

        currentWeek.push({
          date: date,
          pagesRead: pagesRead,
          dayOfMonth: day,
          isCurrentMonth: true,
        });

        if (currentWeek.length === 7) {
          weeks.push({ days: currentWeek });
          currentWeek = [];
        }
      }

      if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
          currentWeek.push({
            date: new Date(this.currentYear, month, daysInMonth + (currentWeek.length - startingDayOfWeek)),
            pagesRead: 0,
            dayOfMonth: 0,
            isCurrentMonth: false,
          });
        }
        weeks.push({ days: currentWeek });
      }

      this.calendarMonths.push({ monthName, weeks });
    }
  }

  getDayClass(pagesRead: number): string {
    if (pagesRead === 0) {
      return 'day-0';
    } else if (pagesRead > 0 && pagesRead <= 15) {
      return 'day-low';
    } else if (pagesRead > 15 && pagesRead < 50) {
      return 'day-medium';
    } else {
      return 'day-high';
    }
  }

  getTooltipText(day: CalendarDay): string {
    if (!day.isCurrentMonth) return '';
    return day.pagesRead === 0 ? 'No pages' : `${day.pagesRead} pages`;
  }

  isToday(date: Date): boolean {
    const today = new Date();
    // Normalize both dates to midnight for accurate comparison
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate.getTime() === today.getTime();
  }

  getMonthTotal(month: CalendarMonth): number {
    let total = 0;
    month.weeks.forEach(week => {
      week.days.forEach(day => {
        if (day.isCurrentMonth) {
          total += day.pagesRead;
        }
      });
    });
    return total;
  }

  getMonthActiveDays(month: CalendarMonth): number {
    let days = 0;
    month.weeks.forEach(week => {
      week.days.forEach(day => {
        if (day.isCurrentMonth && day.pagesRead > 0) {
          days++;
        }
      });
    });
    return days;
  }
}