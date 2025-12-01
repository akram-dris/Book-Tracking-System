import { Component, OnInit, Inject, Optional } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthorService } from '../../services/author';
import { NotificationService } from '../../services/notification';
import { CreateAuthor } from '../../models/create-author.model';
import { GetAuthor } from '../../models/get-author.model';
import { UpdateAuthor } from '../../models/update-author.model';
import { environment } from '../../../environments/environment';
import { CommonModule, Location } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroXMark, heroPhoto, heroUser, heroDocumentText, heroPlus, heroPencil, heroArrowLeft } from '@ng-icons/heroicons/outline';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-author-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    CommonModule,
    NgIconComponent,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatTooltipModule
  ],
  providers: [provideIcons({ heroXMark, heroPhoto, heroUser, heroDocumentText, heroPlus, heroPencil, heroArrowLeft })],
  templateUrl: './author-form.html',
  styleUrls: ['./author-form.css']
})
export class AuthorFormComponent implements OnInit {
  authorForm: FormGroup;
  isEditMode = false;
  authorId: number | null = null;
  selectedFile: File | null = null;
  imagePreviewUrl: string | ArrayBuffer | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authorService: AuthorService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private location: Location,
    @Optional() public dialogRef: MatDialogRef<AuthorFormComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { authorId: number }
  ) {
    this.authorForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      bio: ['', [Validators.maxLength(1000)]],
      imageFile: [null]
    });
  }

  ngOnInit(): void {
    if (this.data && this.data.authorId) {
      this.authorId = this.data.authorId;
    } else {
      this.authorId = this.route.snapshot.params['id'];
    }
    if (this.authorId) {
      this.isEditMode = true;
      this.authorService.getAuthor(this.authorId).subscribe({
        next: (result) => {
          if (result.isSuccess && result.data) {
            this.authorForm.patchValue(result.data);
            if (result.data.imageUrl) {
              this.imagePreviewUrl = environment.rootUrl + result.data.imageUrl;
            }
          } else {
            console.error('Error loading author:', result.errors);
            this.notificationService.showError('Failed to load author details');
          }
        },
        error: (err) => {
          console.error('Error loading author:', err);
          this.notificationService.showError('Failed to load author details');
        }
      });
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(event: Event): void {
    event.stopPropagation();
    this.selectedFile = null;
    this.imagePreviewUrl = null;
    this.authorForm.patchValue({ imageFile: null });
  }

  onSubmit(): void {
    if (this.authorForm.valid) {
      this.isLoading = true;
      const authorData = this.authorForm.value;
      if (this.selectedFile) {
        authorData.imageFile = this.selectedFile;
      }

      if (this.isEditMode && this.authorId) {
        this.authorService.updateAuthor(this.authorId, authorData as UpdateAuthor).subscribe({
          next: (result) => {
            if (result.isSuccess) {
              this.notificationService.showSuccess('Author updated successfully');
              if (this.dialogRef) {
                this.dialogRef.close(true);
              } else {
                this.location.back();
              }
            } else {
              console.error('Error updating author:', result.errors);
              this.notificationService.showError('Failed to update author');
            }
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error updating author:', err);
            this.notificationService.showError('Failed to update author');
            this.isLoading = false;
          }
        });
      } else {
        this.authorService.addAuthor(authorData as CreateAuthor).subscribe({
          next: (result) => {
            if (result.isSuccess) {
              this.notificationService.showSuccess('Author added successfully');
              if (this.dialogRef) {
                this.dialogRef.close(true);
              } else {
                this.router.navigate(['/authors']);
              }
            } else {
              console.error('Error adding author:', result.errors);
              this.notificationService.showError('Failed to add author');
            }
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error adding author:', err);
            this.notificationService.showError('Failed to add author');
            this.isLoading = false;
          }
        });
      }
    }
  }

  goBack(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    } else {
      this.location.back();
    }
  }
}
