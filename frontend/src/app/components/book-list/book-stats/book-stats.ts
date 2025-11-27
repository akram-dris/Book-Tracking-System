import { Component, input } from '@angular/core';

export interface BookStatistics {
  total: number;
  notReading: number;
  planning: number;
  currentlyReading: number;
  completed: number;
  summarized: number;
}

@Component({
  selector: 'app-book-stats',
  imports: [],
  templateUrl: './book-stats.html',
  styleUrl: './book-stats.css',
  standalone: true
})
export class BookStatsComponent {
  stats = input<BookStatistics>({
    total: 0,
    notReading: 0,
    planning: 0,
    currentlyReading: 0,
    completed: 0,
    summarized: 0
  });
}
