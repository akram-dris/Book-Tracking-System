import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GetReadingSession } from '../../models/get-reading-session.model';
import { ReadingStatus } from '../../models/enums/reading-status.enum';

@Component({
  selector: 'app-note-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './note-modal.component.html',
  styleUrls: ['./note-modal.component.css']
})
export class NoteModalComponent implements OnInit {
  @Input() session: GetReadingSession | null = null;
  @Input() bookStatus: ReadingStatus | null = null;
  @Output() noteSaved = new EventEmitter<GetReadingSession>();
  @Output() close = new EventEmitter<void>();

  noteForm: FormGroup;
  isReadOnly: boolean = false;

  constructor(private fb: FormBuilder) {
    this.noteForm = this.fb.group({
      summary: ['']
    });
  }

  ngOnInit(): void {
    if (this.session) {
      this.noteForm.patchValue({
        summary: this.session.summary || ''
      });
    }
    if (this.bookStatus === ReadingStatus.Completed) {
      this.isReadOnly = true;
      this.noteForm.disable();
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
