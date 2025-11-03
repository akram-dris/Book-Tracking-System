import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StreakService } from '../../services/streak.service';
import { Streak } from '../../models/streak.model';

@Component({
  selector: 'app-streak-indicator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './streak-indicator.html',
  styleUrl: './streak-indicator.css',
})
export class StreakIndicatorComponent implements OnInit {
  streakData: Streak | null = null;
  loading: boolean = false;
  isStreakActive: boolean = false;

  constructor(private streakService: StreakService) { }

  ngOnInit(): void {
    this.loadStreakData();
  }

  loadStreakData(): void {
    this.loading = true;
    this.streakService.getStreakData().subscribe({
      next: (data) => {
        this.streakData = data;
        this.isStreakActive = data.currentStreak > 0;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching streak data', err);
        this.loading = false;
      },
    });
  }
}
