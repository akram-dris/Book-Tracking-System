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
import { heroXMark, heroPhoto } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-author-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule, NgIconComponent],
  viewProviders: [provideIcons({ heroXMark, heroPhoto })],
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
          this.router.navigate(['/authors']);
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
}
