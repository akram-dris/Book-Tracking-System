import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeatmapService } from '../../services/heatmap.service';

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

@Component({
  selector: 'app-heatmap',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './heatmap.html',
  styleUrl: './heatmap.css',
})
export class HeatmapComponent implements OnInit {
  currentYear: number = new Date().getFullYear();
  years: number[] = [];
  heatmapData: { [key: string]: number } = {};
  calendarMonths: CalendarMonth[] = [];
  loading: boolean = false;

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
        this.generateCalendarGrid();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching heatmap data', err);
        this.loading = false;
      },
    });
  }

  onYearChange(): void {
    this.loadHeatmapData();
  }

  generateCalendarGrid(): void {
    this.calendarMonths = [];
    const today = new Date();

    for (let month = 0; month < 12; month++) {
      const monthName = new Date(this.currentYear, month, 1).toLocaleString('default', { month: 'long' });
      const weeks: CalendarWeek[] = [];
      let currentWeek: CalendarDay[] = [];

      const firstDayOfMonth = new Date(this.currentYear, month, 1);
      const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday

      // Fill leading empty days of the first week
      for (let i = 0; i < startingDayOfWeek; i++) {
        currentWeek.push({
          date: new Date(this.currentYear, month, 1 - (startingDayOfWeek - i)),
          pagesRead: 0,
          dayOfMonth: 0, // Placeholder for empty days
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

      // Fill trailing empty days of the last week
      if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
          currentWeek.push({
            date: new Date(this.currentYear, month, daysInMonth + (currentWeek.length - startingDayOfWeek)),
            pagesRead: 0,
            dayOfMonth: 0, // Placeholder for empty days
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
}