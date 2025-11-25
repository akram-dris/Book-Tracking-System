import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RecommendationService } from '../../services/recommendation';
import { Recommendation } from '../../models/recommendation.model';
import { environment } from '../../../environments/environment';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroStar, heroBookOpen, heroSparkles } from '@ng-icons/heroicons/outline';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [CommonModule, NgIconComponent, NgxSkeletonLoaderModule],
  templateUrl: './recommendations.html',
  styleUrl: './recommendations.css',
  providers: [provideIcons({ heroStar, heroBookOpen, heroSparkles })]
})
export class RecommendationsComponent implements OnInit {
  recommendations: Recommendation[] = [];
  loading = true;
  error: string | null = null;
  rootUrl = environment.rootUrl;

  constructor(
    private recommendationService: RecommendationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadRecommendations();
  }

  loadRecommendations(): void {
    this.loading = true;
    this.error = null;

    this.recommendationService.getRecommendations().subscribe({
      next: (result) => {
        if (result.isSuccess && result.data) {
          this.recommendations = result.data;
        } else {
          console.error('Error loading recommendations:', result.errors);
          this.error = 'Failed to load recommendations';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading recommendations:', err);
        this.error = 'Failed to load recommendations';
        this.loading = false;
      }
    });
  }

  navigateToBook(bookId: number): void {
    this.router.navigate(['/books', bookId]);
  }

  getRatingColor(rating: number | null): string {
    if (!rating) return 'badge-ghost';
    if (rating >= 4.5) return 'badge-warning';  // Gold
    if (rating >= 4.0) return 'badge-success';  // Green  
    if (rating >= 3.0) return 'badge-info';     // Cyan
    if (rating >= 2.0) return 'badge-accent';   // Orange
    return 'badge-error';                        // Red
  }
}
