import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl, FormsModule } from '@angular/forms';
import { CommonModule, NgFor } from '@angular/common';
import { TagService } from '../../services/tag.service';
import { GetTag } from '../../models/get-tag.model';
import { CreateTag } from '../../models/create-tag.model';
import { UpdateTag } from '../../models/update-tag.model';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from '../../services/notification.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroStar, heroArrowsUpDown } from '@ng-icons/heroicons/outline';
import { InfiniteScrollDirective } from '../../directives/infinite-scroll.directive';
import { PaginationParams } from '../../models/result';

@Component({
  selector: 'app-tag-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgFor, FormsModule, NgIconComponent, InfiniteScrollDirective],
  templateUrl: './tag-management.component.html',
  styleUrls: ['./tag-management.component.css'],
  viewProviders: [provideIcons({ heroStar, heroArrowsUpDown })]
})
export class TagManagementComponent implements OnInit {
  tagForm: FormGroup;
  tags: GetTag[] = [];
  displayedTags: GetTag[] = [];
  tagUsageCounts: { [key: number]: number } = {};
  isLoading = false;
  isEditingTag: boolean = false;
  editingTagId: number | null = null;
  sortBy: string = 'name-asc';
  currentPage: number = 1;
  pageSize: number = 20;
  hasMorePages: boolean = true;
  isLoadingMore: boolean = false;

  sortOptions = [
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'rating-desc', label: 'Highest Rated' },
    { value: 'usage-desc', label: 'Most Used' }
  ];

  get nameControl(): FormControl {
    return this.tagForm.get('name') as FormControl;
  }

  constructor(
    private fb: FormBuilder,
    private tagService: TagService,
    private dialog: MatDialog,
    private notificationService: NotificationService
  ) {
    this.tagForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]]
    });
  }

  ngOnInit(): void {
    this.loadTags();
    this.loadTagUsageCounts();
  }

  loadTags(): void {
    this.isLoading = true;
    this.currentPage = 1;
    this.tags = [];
    this.displayedTags = [];
    this.hasMorePages = true;

    const params: PaginationParams = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      sort: this.sortBy
    };

    this.tagService.getTagsPaginated(params).subscribe({
      next: (result) => {
        if (result.isSuccess && result.data) {
          this.tags = result.data.items;
          this.displayedTags = result.data.items;
          this.hasMorePages = result.data.items.length === this.pageSize;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading tags', err);
        this.isLoading = false;
      }
    });
  }

  loadMore(): void {
    if (this.isLoadingMore || !this.hasMorePages) return;

    this.isLoadingMore = true;
    this.currentPage++;

    const params: PaginationParams = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      sort: this.sortBy
    };

    this.tagService.getTagsPaginated(params).subscribe({
      next: (result) => {
        if (result.isSuccess && result.data) {
          const newTags = result.data.items;
          this.tags = [...this.tags, ...newTags];
          this.displayedTags = [...this.displayedTags, ...newTags];
          this.hasMorePages = newTags.length === this.pageSize;
        }
        this.isLoadingMore = false;
      },
      error: (err) => {
        console.error('Error loading more tags', err);
        this.isLoadingMore = false;
      }
    });
  }

  sortTags(): void {
    // For paginated data, re-fetch with new sort
    this.loadTags();
  }

  onSortChange(): void {
    this.sortTags();
  }

  loadTagUsageCounts(): void {
    this.tagService.getTagUsageCounts().subscribe({
      next: (counts) => {
        this.tagUsageCounts = counts;
        this.sortTags();
      },
      error: (err) => {
        console.error('Error loading tag usage counts', err);
      }
    });
  }

  onSubmit(): void {
    if (this.tagForm.valid) {
      this.isLoading = true;
      if (this.isEditingTag && this.editingTagId !== null) {
        const updatedTag: UpdateTag = { name: this.tagForm.value.name };
        this.tagService.updateTag(this.editingTagId, updatedTag).subscribe({
          next: () => {
            this.tagForm.reset();
            this.isEditingTag = false;
            this.editingTagId = null;
            this.loadTags();
            this.notificationService.showSuccess('Tag updated successfully');
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error updating tag', err);
            this.isLoading = false;
          }
        });
      } else {
        const newTag: CreateTag = { name: this.tagForm.value.name };
        this.tagService.createTag(newTag).subscribe({
          next: () => {
            this.tagForm.reset();
            this.loadTags();
            this.loadTagUsageCounts();
            this.notificationService.showSuccess('Tag added successfully');
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error creating tag', err);
            this.isLoading = false;
          }
        });
      }
    }
  }

  editTag(tag: GetTag): void {
    this.isEditingTag = true;
    this.editingTagId = tag.id;
    this.tagForm.patchValue({ name: tag.name });
  }

  cancelEdit(): void {
    this.isEditingTag = false;
    this.editingTagId = null;
    this.tagForm.reset();
  }

  deleteTag(id: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete Tag',
        message: 'Are you sure you want to delete this tag?',
        confirmText: 'Delete',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.tagService.deleteTag(id).subscribe({
          next: () => {
            this.loadTags();
            this.loadTagUsageCounts();
            this.notificationService.showSuccess('Tag deleted successfully');
          },
          error: (err) => {
            console.error('Error deleting tag', err);
          }
        });
      }
    });
  }

  getRatingColorClass(rating: number | undefined): string {
    if (!rating) return 'bg-gradient-to-t from-primary/80 via-primary/40 to-transparent';

    const roundedRating = Math.round(rating);

    switch (roundedRating) {
      case 5: return 'bg-gradient-to-t from-amber-600/90 via-amber-500/60 to-transparent';
      case 4: return 'bg-gradient-to-t from-emerald-600/90 via-emerald-500/60 to-transparent';
      case 3: return 'bg-gradient-to-t from-cyan-600/90 via-cyan-500/60 to-transparent';
      case 2: return 'bg-gradient-to-t from-orange-600/90 via-orange-500/60 to-transparent';
      case 1: return 'bg-gradient-to-t from-rose-600/90 via-rose-500/60 to-transparent';
      default: return 'bg-gradient-to-t from-primary/80 via-primary/40 to-transparent';
    }
  }

  getRatingBorderClass(rating: number | undefined): string {
    if (!rating) return 'hover:border-primary hover:bg-primary/10 hover:shadow-primary/20';

    const roundedRating = Math.round(rating);

    switch (roundedRating) {
      case 5: return 'hover:border-amber-400 hover:bg-amber-500/10 hover:shadow-amber-500/20';
      case 4: return 'hover:border-emerald-400 hover:bg-emerald-500/10 hover:shadow-emerald-500/20';
      case 3: return 'hover:border-cyan-400 hover:bg-cyan-500/10 hover:shadow-cyan-500/20';
      case 2: return 'hover:border-orange-400 hover:bg-orange-500/10 hover:shadow-orange-500/20';
      case 1: return 'hover:border-rose-400 hover:bg-rose-500/10 hover:shadow-rose-500/20';
      default: return 'hover:border-primary hover:bg-primary/10 hover:shadow-primary/20';
    }
  }

  getRatingBadgeClass(rating: number | undefined): string {
    if (!rating) return '';

    const roundedRating = Math.round(rating);

    switch (roundedRating) {
      case 5: return 'bg-amber-500 border-amber-400';
      case 4: return 'bg-emerald-500 border-emerald-400';
      case 3: return 'bg-cyan-500 border-cyan-400';
      case 2: return 'bg-orange-500 border-orange-400';
      case 1: return 'bg-rose-500 border-rose-400';
      default: return 'bg-gray-500 border-gray-400';
    }
  }
}
