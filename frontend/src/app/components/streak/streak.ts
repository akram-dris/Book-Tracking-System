import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, keyframes } from '@angular/animations';
import { StreakService } from '../../services/streak.service';
import { Streak } from '../../models/streak.model';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroFire, heroTrophy, heroCalendar } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-streak',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  viewProviders: [provideIcons({ heroFire, heroTrophy, heroCalendar })],
  templateUrl: './streak.html',
  styleUrl: './streak.css',
  animations: [
    trigger('celebrate', [
      transition(':enter', [
        animate('800ms ease-out', keyframes([
          style({ transform: 'scale(0.8) rotate(-10deg)', opacity: 0, offset: 0 }),
          style({ transform: 'scale(1.1) rotate(5deg)', opacity: 1, offset: 0.5 }),
          style({ transform: 'scale(1) rotate(0deg)', opacity: 1, offset: 1 })
        ]))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class StreakComponent implements OnInit {
  streakData: Streak | null = null;
  loading: boolean = false;
  showCelebration: boolean = false;

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
        if (data.currentStreak > 0 && data.currentStreak % 7 === 0) {
          this.showCelebration = true;
        }
      },
      error: (err) => {
        console.error('Error fetching streak data', err);
        this.loading = false;
      },
    });
  }

  getMotivationalMessage(): string {
    if (!this.streakData) return '';
    const streak = this.streakData.currentStreak;
    if (streak === 0) return 'Start your reading journey today!';
    if (streak === 1) return 'Great start! Keep it going! 🌱';
    if (streak < 7) return 'You\'re building momentum! 🔥';
    if (streak < 30) return 'Amazing consistency! 🌟';
    if (streak < 100) return 'You\'re on fire! 🚀';
    return 'Legendary streak! 👑';
  }

  getStreakEmoji(): string {
    if (!this.streakData) return '📖';
    const streak = this.streakData.currentStreak;
    if (streak === 0) return '📖';
    if (streak < 7) return '🔥';
    if (streak < 30) return '⚡';
    if (streak < 100) return '🌟';
    return '👑';
  }
}