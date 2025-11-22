import { Component, output, OnInit, inject } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroFunnel, heroXMark } from '@ng-icons/heroicons/outline';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthorService } from '../../../services/author.service';
import { TagService } from '../../../services/tag.service';
import { ReadingStatus } from '../../../models/enums/reading-status.enum';

export interface BookFilters {
  status?: ReadingStatus;
  authorId?: number;
  tagId?: number;
}

@Component({
  selector: 'app-book-filters',
  imports: [NgIconComponent, CommonModule, FormsModule],
  templateUrl: './book-filters.html',
  styleUrl: './book-filters.css',
  standalone: true,
  viewProviders: [provideIcons({ heroFunnel, heroXMark })]
})
export class BookFiltersComponent implements OnInit {
  private authorService = inject(AuthorService);
  private tagService = inject(TagService);

  filtersChanged = output<BookFilters>();

  authors: any[] = [];
  tags: any[] = [];

  currentFilters: BookFilters = {};

  // Reading status options
  statusOptions = [
    { value: ReadingStatus.NotReading, label: 'Not Reading' },
    { value: ReadingStatus.Planning, label: 'Planning' },
    { value: ReadingStatus.CurrentlyReading, label: 'Currently Reading' },
    { value: ReadingStatus.Completed, label: 'Completed' },
    { value: ReadingStatus.Summarized, label: 'Summarized' }
  ];

  ngOnInit(): void {
    this.loadAuthors();
    this.loadTags();
  }

  loadAuthors(): void {
    this.authorService.getAuthors().subscribe({
      next: (authors) => this.authors = authors,
      error: (err) => console.error('Error loading authors:', err)
    });
  }

  loadTags(): void {
    this.tagService.getTags().subscribe({
      next: (tags) => this.tags = tags,
      error: (err) => console.error('Error loading tags:', err)
    });
  }

  onFilterChange(): void {
    this.filtersChanged.emit(this.currentFilters);
  }

  clearFilters(): void {
    this.currentFilters = {};
    this.filtersChanged.emit(this.currentFilters);
  }

  get hasActiveFilters(): boolean {
    return !!this.currentFilters.status || !!this.currentFilters.authorId || !!this.currentFilters.tagId;
  }
}
