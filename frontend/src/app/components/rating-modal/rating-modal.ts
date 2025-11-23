import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RatingModule } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroStar, heroXMark } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-rating-modal',
  standalone: true,
  imports: [CommonModule, RatingModule, FormsModule, NgIconComponent],
  templateUrl: './rating-modal.html',
  styleUrls: ['./rating-modal.css'],
  viewProviders: [
    provideIcons({
      heroStar,
      heroXMark
    })
  ]
})
export class RatingModalComponent implements OnInit {
  @Input() isOpen: boolean = false;
  @Input() bookTitle: string = '';
  @Input() bookCover: string | undefined = '';
  @Input() currentRating: number | null = null;

  @Output() save = new EventEmitter<number>();
  @Output() cancel = new EventEmitter<void>();

  selectedRating: number | null = null;
  rootUrl = environment.rootUrl;
  isAnimatingIn: boolean = false;

  ngOnInit(): void {
    this.selectedRating = this.currentRating;
    if (this.isOpen) {
      setTimeout(() => this.isAnimatingIn = true, 10);
    }
  }

  ngOnChanges(): void {
    if (this.isOpen) {
      this.selectedRating = this.currentRating;
      setTimeout(() => this.isAnimatingIn = true, 10);
    } else {
      this.isAnimatingIn = false;
    }
  }

  onRatingChange(rating: number): void {
    this.selectedRating = rating;
  }

  onSave(): void {
    if (this.selectedRating !== null) {
      this.save.emit(this.selectedRating);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  get canSave(): boolean {
    return this.selectedRating !== null && this.selectedRating >= 0.5 && this.selectedRating <= 5;
  }

  get ratingText(): string {
    if (!this.selectedRating) return 'Select your rating';
    return `${this.selectedRating.toFixed(1)} out of 5`;
  }
}
