import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GetBook } from '../../../models/get-book.model';
import { ReadingStatus } from '../../../models/enums/reading-status.enum';
import { environment } from 'src/environments/environment';

export interface BookWithProgress extends GetBook {
  progressPercentage?: number;
  statusName?: string;
  statusBadgeClass?: string;
}

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './book-card.html',
  styleUrls: ['./book-card.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookCardComponent {
  @Input() book!: BookWithProgress;
  @Input() progress?: number;

  ReadingStatus = ReadingStatus;
  rootUrl: string = environment.rootUrl;

  getRatingColorClass(rating: number | undefined): string {
    if (!rating) return 'bg-gradient-to-t from-primary/80 via-primary/40 to-transparent';

    const roundedRating = Math.floor(rating);

    if (roundedRating >= 4) return 'bg-gradient-to-t from-amber-500/90 via-amber-400/60 to-transparent'; // Gold (4-5)
    if (roundedRating >= 2) return 'bg-gradient-to-t from-slate-500/90 via-slate-400/60 to-transparent'; // Silver (2-3)
    return 'bg-gradient-to-t from-orange-700/90 via-orange-600/60 to-transparent'; // Bronze (1)
  }

  getRatingBorderClass(rating: number | undefined): string {
    if (!rating) return 'hover:shadow-primary/20 hover:border-primary';

    const roundedRating = Math.floor(rating);

    if (roundedRating >= 4) return 'hover:shadow-amber-500/40 hover:border-amber-400'; // Gold
    if (roundedRating >= 2) return 'hover:shadow-slate-500/40 hover:border-slate-400'; // Silver
    return 'hover:shadow-orange-700/40 hover:border-orange-600'; // Bronze
  }
}
