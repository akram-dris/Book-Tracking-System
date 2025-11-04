import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, keyframes } from '@angular/animations';
import { StreakService } from '../../services/streak.service';
import { Streak } from '../../models/streak.model';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroFire } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-streak-indicator',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  viewProviders: [provideIcons({ heroFire })],
  templateUrl: './streak-indicator.html',
  styleUrl: './streak-indicator.css',
  animations: [
    trigger('flameAnimation', [
      transition('* => *', [
        animate('600ms ease-out', keyframes([
          style({ transform: 'scale(1) rotate(0deg)', offset: 0 }),
          style({ transform: 'scale(1.15) rotate(-5deg)', offset: 0.5 }),
          style({ transform: 'scale(1) rotate(0deg)', offset: 1 })
        ]))
      ])
    ])
  ]
})
export class StreakIndicatorComponent implements OnInit {
  streakData: Streak | null = null;
  loading: boolean = false;
  isStreakActive: boolean = false;
  animationTrigger: number = 0;

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
        if (this.isStreakActive) {
          this.animationTrigger++;
        }
      },
      error: (err) => {
        console.error('Error fetching streak data', err);
        this.loading = false;
      },
    });
  }

  getStreakColor(): string {
    if (!this.streakData) return 'text-base-content/40';
    const streak = this.streakData.currentStreak;
    if (streak === 0) return 'text-base-content/40';
    if (streak < 7) return 'text-orange-500';
    if (streak < 30) return 'text-orange-600';
    return 'text-red-500';
  }
}
