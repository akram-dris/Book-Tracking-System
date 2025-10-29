
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthorService } from '../../services/author.service';
import { CreateAuthor } from '../../models/create-author.model';
import { GetAuthor } from '../../models/get-author.model';
import { UpdateAuthor } from '../../models/update-author.model';

@Component({
  selector: 'app-author-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './author-form.component.html',
  styleUrls: ['./author-form.component.css']
})
export class AuthorFormComponent implements OnInit {
  authorForm: FormGroup;
  isEditMode = false;
  authorId: number | null = null;
  selectedFile: File | null = null;

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
      });
    }
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] ?? null;
  }

  onSubmit(): void {
    if (this.authorForm.valid) {
      const authorData = this.authorForm.value;
      if (this.selectedFile) {
        authorData.imageFile = this.selectedFile;
      }

      if (this.isEditMode && this.authorId) {
        console.log('Updating author with data:', authorData);
        this.authorService.updateAuthor(this.authorId, authorData as UpdateAuthor).subscribe(() => {
          this.router.navigate(['/authors']);
        });
      } else {
        this.authorService.addAuthor(authorData as CreateAuthor).subscribe(() => {
          this.router.navigate(['/authors']);
        });
      }
    }
  }
}
