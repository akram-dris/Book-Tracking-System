import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StreakService } from '../../services/streak.service';
import { Streak } from '../../models/streak.model';

@Component({
  selector: 'app-streak',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './streak.html',
  styleUrl: './streak.css',
})
export class StreakComponent implements OnInit {
  streakData: Streak | null = null;
  loading: boolean = false;

  constructor(private streakService: StreakService) { }

  ngOnInit(): void {
    this.loadStreakData();
  }

  loadStreakData(): void {
    this.loading = true;
    this.streakService.getStreakData().subscribe({
      next: (data) => {
        this.streakData = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching streak data', err);
        this.loading = false;
      },
    });
  }
}