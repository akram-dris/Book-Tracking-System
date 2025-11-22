
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { CommonModule, NgFor } from '@angular/common';
import { TagService } from '../../services/tag.service';
import { GetTag } from '../../models/get-tag.model';
import { CreateTag } from '../../models/create-tag.model';
import { UpdateTag } from '../../models/update-tag.model';

@Component({
  selector: 'app-tag-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgFor],
  templateUrl: './tag-management.component.html',
  styleUrls: ['./tag-management.component.css']
})
export class TagManagementComponent implements OnInit {
  tagForm: FormGroup;
  tags: GetTag[] = [];
  tagUsageCounts: { [key: number]: number } = {};
  isLoading = false;
  isEditingTag: boolean = false;
  editingTagId: number | null = null;

  get nameControl(): FormControl {
    return this.tagForm.get('name') as FormControl;
  }

  constructor(
    private fb: FormBuilder,
    private tagService: TagService
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
    this.tagService.getTags().subscribe({
      next: (tags) => {
        this.tags = tags;
      },
      error: (err) => {
        console.error('Error loading tags', err);
      }
    });
  }

  loadTagUsageCounts(): void {
    this.tagService.getTagUsageCounts().subscribe({
      next: (counts) => {
        this.tagUsageCounts = counts;
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
    if (confirm('Are you sure you want to delete this tag?')) {
      this.tagService.deleteTag(id).subscribe({
        next: () => {
          this.loadTags();
          this.loadTagUsageCounts();
        },
        error: (err) => {
          console.error('Error deleting tag', err);
        }
      });
    }
  }
}
