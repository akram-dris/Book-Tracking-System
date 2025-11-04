import { Component, input } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroBookOpen, heroCheckCircle, heroClock } from '@ng-icons/heroicons/outline';

export interface BookStatistics {
  total: number;
  currentlyReading: number;
  completed: number;
  toRead: number;
}

@Component({
  selector: 'app-book-stats',
  imports: [NgIconComponent],
  templateUrl: './book-stats.html',
  styleUrl: './book-stats.css',
  standalone: true,
  viewProviders: [provideIcons({ heroBookOpen, heroCheckCircle, heroClock })]
})
export class BookStatsComponent {
  stats = input<BookStatistics>({ total: 0, currentlyReading: 0, completed: 0, toRead: 0 });
}
