import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthorService } from '../../services/author.service';
import { CreateAuthor } from '../../models/create-author.model';
import { GetAuthor } from '../../models/get-author.model';
import { UpdateAuthor } from '../../models/update-author.model';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { ImageCropperModule, ImageCroppedEvent } from 'ngx-image-cropper';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroScissors, heroXMark, heroInformationCircle, heroCheck } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-author-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule, ImageCropperModule, NgIconComponent],
  viewProviders: [provideIcons({ heroScissors, heroXMark, heroInformationCircle, heroCheck })],
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

  imageChangedEvent: any = '';
  croppedImage: any = '';
  showCropper = false;

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
    this.imageChangedEvent = event;
    this.showCropper = true;
  }

  imageCropped(event: ImageCroppedEvent) {
    if (event.blob) {
      const reader = new FileReader();
      reader.readAsDataURL(event.blob);
      reader.onloadend = () => {
        this.croppedImage = reader.result;
      };
    } else {
      console.error('Cropped image blob data is not available.');
    }
  }

  saveCroppedImage() {
    if (this.croppedImage) {
      this.imagePreviewUrl = this.croppedImage;
      this.selectedFile = this.base64ToFile(this.croppedImage, this.imageChangedEvent.target.files[0].name);
      this.showCropper = false;
    } else {
      console.error('Cropped image is not available to save.');
    }
  }

  cancelCropping() {
    this.showCropper = false;
    this.imageChangedEvent = null;
  }

  base64ToFile(data: any, filename: string): File {
    const arr = data.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
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
