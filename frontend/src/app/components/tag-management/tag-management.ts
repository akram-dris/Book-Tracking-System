
import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl, FormsModule } from '@angular/forms';
import * as common from '@angular/common';
import { RouterModule } from '@angular/router';
import { TagService } from '../../services/tag';
import { BookService } from '../../services/book';
import { ReadingStatusService } from '../../services/reading-status';
import { GetTag } from '../../models/get-tag.model';
import { GetBook } from '../../models/get-book.model';
import { CreateTag } from '../../models/create-tag.model';
import { UpdateTag } from '../../models/update-tag.model';
import { ReadingStatus } from '../../models/enums/reading-status.enum';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NotificationService } from '../../services/notification';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroStar, heroArrowsUpDown, heroPlus, heroXMark, heroTag, heroCheckCircle, heroBookOpen } from '@ng-icons/heroicons/outline';
import { InfiniteScrollDirective } from '../../directives/infinite-scroll';
import { PaginationParams } from '../../models/result';

interface BookWithProgress extends GetBook {
  progressPercentage?: number;
  statusName?: string;
  statusBadgeClass?: string;
}

import { EmptyStateComponent } from '../shared/empty-state/empty-state';

@Component({
  selector: 'app-tag-management',
  standalone: true,
  imports: [common.CommonModule, ReactiveFormsModule, FormsModule, RouterModule, NgIconComponent, MatIconModule, MatButtonModule, InfiniteScrollDirective, EmptyStateComponent],
  templateUrl: './tag-management.html',
  styleUrls: ['./tag-management.css'],
  viewProviders: [provideIcons({ heroStar, heroArrowsUpDown, heroPlus, heroXMark, heroTag, heroCheckCircle, heroBookOpen })]
})
export class TagManagementComponent implements OnInit {
  @ViewChild('tagModal') tagModal!: TemplateRef<any>;
  @ViewChild('tagDetailsModal') tagDetailsModal!: TemplateRef<any>;

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

  // Tag Details Modal
  selectedTag: GetTag | null = null;
  tagBooks: BookWithProgress[] = [];
  isLoadingTagBooks: boolean = false;
  tagBooksPage: number = 1;
  tagBooksHasMore: boolean = true;

  // Expose ReadingStatus enum to template
  ReadingStatus = ReadingStatus;

  // Add rootUrl for image paths
  rootUrl: string = environment.rootUrl;

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
    private bookService: BookService,
    private readingStatusService: ReadingStatusService,
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
        } else {
          console.error('Error loading tags', result.errors);
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
        } else {
          console.error('Error loading more tags', result.errors);
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
      next: (result) => {
        if (result.isSuccess && result.data) {
          this.tagUsageCounts = result.data;
          this.sortTags();
        } else {
          console.error('Error loading tag usage counts', result.errors);
        }
      },
      error: (err) => {
        console.error('Error loading tag usage counts', err);
      }
    });
  }

  openAddTagModal(): void {
    this.isEditingTag = false;
    this.editingTagId = null;
    this.tagForm.reset();
    this.dialog.open(this.tagModal, {
      width: '400px',
      panelClass: 'glass-modal'
    });
  }

  onSubmit(): void {
    if (this.tagForm.valid) {
      this.isLoading = true;
      if (this.isEditingTag && this.editingTagId !== null) {
        const updatedTag: UpdateTag = { name: this.tagForm.value.name };
        this.tagService.updateTag(this.editingTagId, updatedTag).subscribe({
          next: (result) => {
            if (result.isSuccess) {
              this.tagForm.reset();
              this.isEditingTag = false;
              this.editingTagId = null;
              this.loadTags();
              this.dialog.closeAll();
              this.notificationService.showSuccess('Tag updated successfully');
            } else {
              console.error('Error updating tag', result.errors);
              this.notificationService.showError('Failed to update tag');
            }
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error updating tag', err);
            this.isLoading = false;
            this.notificationService.showError('Failed to update tag');
          }
        });
      } else {
        const newTag: CreateTag = { name: this.tagForm.value.name };
        this.tagService.createTag(newTag).subscribe({
          next: (result) => {
            if (result.isSuccess) {
              this.tagForm.reset();
              this.loadTags();
              this.loadTagUsageCounts();
              this.dialog.closeAll();
              this.notificationService.showSuccess('Tag added successfully');
            } else {
              console.error('Error creating tag', result.errors);
              this.notificationService.showError('Failed to create tag');
            }
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error creating tag', err);
            this.isLoading = false;
            this.notificationService.showError('Failed to create tag');
          }
        });
      }
    }
  }

  editTag(tag: GetTag): void {
    this.isEditingTag = true;
    this.editingTagId = tag.id;
    this.tagForm.patchValue({ name: tag.name });
    this.dialog.open(this.tagModal, {
      width: '400px',
      panelClass: 'glass-modal'
    });
  }

  closeModal(): void {
    this.dialog.closeAll();
    this.cancelEdit();
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
          next: (deleteResult) => {
            if (deleteResult.isSuccess) {
              this.loadTags();
              this.loadTagUsageCounts();
              this.notificationService.showSuccess('Tag deleted successfully');
            } else {
              console.error('Error deleting tag', deleteResult.errors);
              this.notificationService.showError('Failed to delete tag');
            }
          },
          error: (err) => {
            console.error('Error deleting tag', err);
            this.notificationService.showError('Failed to delete tag');
          }
        });
      }
    });
  }


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

  getRatingBadgeClass(rating: number | undefined): string {
    if (!rating) return '';

    const roundedRating = Math.floor(rating);

    if (roundedRating >= 4) return 'text-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] group-hover:drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'; // Gold
    if (roundedRating >= 2) return 'text-slate-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] group-hover:drop-shadow-[0_0_8px_rgba(203,213,225,0.6)]'; // Silver
    return 'text-orange-700 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] group-hover:drop-shadow-[0_0_8px_rgba(194,65,12,0.6)]'; // Bronze
  }
}
