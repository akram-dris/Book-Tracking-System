import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GetReadingSession } from '../../models/get-reading-session.model';
import { ReadingStatus } from '../../models/enums/reading-status.enum';
import { QuillModule } from 'ngx-quill';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  heroDocumentText, 
  heroBookOpen, 
  heroHashtag,
  heroXMark,
  heroCheckCircle
} from '@ng-icons/heroicons/outline';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-note-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, QuillModule, NgIconComponent, MatButtonModule],
  templateUrl: './note-modal.component.html',
  styleUrls: ['./note-modal.component.css'],
  viewProviders: [provideIcons({ 
    heroDocumentText, 
    heroBookOpen, 
    heroHashtag,
    heroXMark,
    heroCheckCircle
  })]
})
export class NoteModalComponent implements OnInit {
  @Input() session: GetReadingSession | null = null;
  @Input() bookStatus: ReadingStatus | null = null;
  @Output() noteSaved = new EventEmitter<GetReadingSession>();
  @Output() close = new EventEmitter<void>();

  noteForm: FormGroup;
  isReadOnly: boolean = false;
  noteType: 'quote' | 'thought' | 'question' | 'general' = 'general';
  pageNumber: number | null = null;

  quillConfig = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'header': [1, 2, 3, false] }],
      ['link'],
      ['clean']
    ]
  };

  constructor(private fb: FormBuilder) {
    this.noteForm = this.fb.group({
      summary: ['', Validators.required],
      pageNumber: [null],
      noteType: ['general']
    });
  }

  ngOnInit(): void {
    if (this.session) {
      this.noteForm.patchValue({
        summary: this.session.summary || '',
        pageNumber: this.pageNumber || null,
        noteType: this.noteType || 'general'
      });
    }
    if (this.bookStatus === ReadingStatus.Completed) {
      this.isReadOnly = true;
      this.noteForm.disable();
    }
  }

  getNoteTypeIcon(): string {
    switch (this.noteForm.value.noteType) {
      case 'quote': return '💬';
      case 'thought': return '💭';
      case 'question': return '❓';
      default: return '📝';
    }
  }

  getNoteTypeLabel(): string {
    switch (this.noteForm.value.noteType) {
      case 'quote': return 'Quote';
      case 'thought': return 'Thought';
      case 'question': return 'Question';
      default: return 'General Note';
    }
  }

  onSubmit(): void {
    if (this.noteForm.valid && this.session && !this.isReadOnly) {
      const updatedSession = { ...this.session, summary: this.noteForm.value.summary };
      this.noteSaved.emit(updatedSession);
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
