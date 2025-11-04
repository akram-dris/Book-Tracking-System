import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate, stagger, query } from '@angular/animations';
import { HeatmapService } from '../../services/heatmap.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroChevronLeft, heroChevronRight } from '@ng-icons/heroicons/outline';

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

@Component({
  selector: 'app-heatmap',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent],
  viewProviders: [provideIcons({ heroChevronLeft, heroChevronRight })],
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
  legendItems: LegendItem[] = [
    { label: 'No activity', className: 'day-0', range: '0 pages' },
    { label: 'Light', className: 'day-1-10', range: '1-10 pages' },
    { label: 'Moderate', className: 'day-11-25', range: '11-25 pages' },
    { label: 'Active', className: 'day-26-50', range: '26-50 pages' },
    { label: 'Very Active', className: 'day-51-100', range: '51-100 pages' },
    { label: 'Super Active', className: 'day-100-plus', range: '100+ pages' }
  ];

  constructor(private heatmapService: HeatmapService) {
    this.generateYears();
  }

  ngOnInit(): void {
    this.loadHeatmapData();
  }

  generateYears(): void {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      this.years.push(i);
    }
  }

  loadHeatmapData(): void {
    this.loading = true;
    this.heatmapService.getHeatmapData(this.currentYear).subscribe({
      next: (data) => {
        this.heatmapData = data;
        this.calculateStats();
        this.generateCalendarGrid();
        this.loading = false;
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

  onYearChange(): void {
    this.loadHeatmapData();
  }

  previousYear(): void {
    this.currentYear--;
    this.loadHeatmapData();
  }

  nextYear(): void {
    this.currentYear++;
    this.loadHeatmapData();
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
    } else if (pagesRead > 0 && pagesRead <= 10) {
      return 'day-1-10';
    } else if (pagesRead > 10 && pagesRead <= 25) {
      return 'day-11-25';
    } else if (pagesRead > 25 && pagesRead <= 50) {
      return 'day-26-50';
    } else if (pagesRead > 50 && pagesRead <= 100) {
      return 'day-51-100';
    } else {
      return 'day-100-plus';
    }
  }

  getTooltipText(day: CalendarDay): string {
    if (!day.isCurrentMonth) return '';
    const dateStr = day.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    return `${dateStr}\n${day.pagesRead} pages read`;
  }
}