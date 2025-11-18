import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthorService } from '../../services/author.service';
import { CreateAuthor } from '../../models/create-author.model';
import { GetAuthor } from '../../models/get-author.model';
import { UpdateAuthor } from '../../models/update-author.model';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroXMark, heroPhoto, heroUser, heroDocumentText, heroPlus, heroPencil, heroArrowLeft } from '@ng-icons/heroicons/outline';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';

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
    MatCardModule
  ],
  viewProviders: [provideIcons({ heroXMark, heroPhoto, heroUser, heroDocumentText, heroPlus, heroPencil, heroArrowLeft })],
  templateUrl: './author-form.component.html',
  styleUrls: ['./author-form.component.css']
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
    private route: ActivatedRoute
  ) {
    this.authorForm = this.fb.group({
      name: ['', Validators.required],
      bio: [''],
      imageFile: [null]
    });
  }

  ngOnInit(): void {
    this.authorId = this.route.snapshot.params['id'];
    if (this.authorId) {
      this.isEditMode = true;
      this.authorService.getAuthor(this.authorId).subscribe((data: GetAuthor) => {
        this.authorForm.patchValue(data);
        if (data.imageUrl) {
          this.imagePreviewUrl = environment.rootUrl + data.imageUrl;
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
        this.authorService.updateAuthor(this.authorId, authorData as UpdateAuthor).subscribe(() => {
          this.router.navigate(['/authors', this.authorId]);
          this.isLoading = false;
        }, () => {
          this.isLoading = false;
        });
      } else {
        this.authorService.addAuthor(authorData as CreateAuthor).subscribe(() => {
          this.router.navigate(['/authors']);
          this.isLoading = false;
        }, () => {
          this.isLoading = false;
        });
      }
    }
  }

  goBack(): void {
    if (this.isEditMode && this.authorId) {
      this.router.navigate(['/authors', this.authorId]);
    } else {
      this.router.navigate(['/authors']);
    }
  }
}
