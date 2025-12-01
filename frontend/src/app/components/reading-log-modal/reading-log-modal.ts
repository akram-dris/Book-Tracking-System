import { Component, OnInit, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GetReadingGoal } from '../../models/get-reading-goal.model';
import { GetReadingSession } from '../../models/get-reading-session.model';
import { ReadingSessionService } from '../../services/reading-session';
import { ReadingStatus } from '../../models/enums/reading-status.enum';
import { NoteModalComponent } from '../note-modal/note-modal';
import { UpdateReadingSession } from '../../models/update-reading-session.model';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from '../../services/notification';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog';

@Component({
  selector: 'app-reading-log-modal',
  standalone: true,
  imports: [CommonModule, NoteModalComponent, MatButtonModule],
  templateUrl: './reading-log-modal.html',
  styleUrls: ['./reading-log-modal.css']
})
export class ReadingLogModalComponent implements OnInit {
  bookId = input<number | null>(null);
  readingGoal = input<GetReadingGoal | null>(null);
  totalPages = input<number | null>(null);
  bookStatus = input<ReadingStatus | null>(null);
  close = output<void>();
  sessionDeleted = output<void>();

  ReadingStatus = ReadingStatus; // Expose enum to template

  readingSessions: GetReadingSession[] = [];
  isLoading = false;
  isNoteModalOpen: boolean = false; // New property
  selectedSessionForNote: GetReadingSession | null = null; // New property

  constructor(
    private readingSessionService: ReadingSessionService,
    private dialog: MatDialog,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    if (this.bookId()) {
      this.isLoading = true;

      this.readingSessionService.getReadingSessionsForBook(this.bookId()!).subscribe({
        next: (result) => {
          if (result.isSuccess && result.data) {

            this.readingSessions = result.data;

          } else {

          }
          this.isLoading = false;
        },
        error: (err) => {

          this.isLoading = false;
        }
      });
    }
  }

  deleteSession(sessionId: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete Reading Session',
        message: 'Are you sure you want to delete this reading session?',
        confirmText: 'Delete',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {

        this.readingSessionService.deleteReadingSession(sessionId).subscribe({
          next: (deleteResult) => {
            if (deleteResult.isSuccess) {

              this.notificationService.showSuccess('Reading session deleted successfully');
              this.loadSessions(); // Refresh the list after deletion
              this.sessionDeleted.emit(); // Emit event to notify parent
            } else {

              this.notificationService.showError('Failed to delete reading session');
            }
          },
          error: (err) => {

            this.notificationService.showError('Failed to delete reading session');
          }
        });
      }
    });
  }

  getGoalStatus(pagesRead: number): string {
    if (!this.readingGoal()) {
      return 'N/A';
    }
    if (pagesRead >= this.readingGoal()!.highGoal) {
      return 'High';
    } else if (pagesRead >= this.readingGoal()!.mediumGoal) {
      return 'Medium';
    } else if (pagesRead >= this.readingGoal()!.lowGoal) {
      return 'Low';
    }
    return 'Below Goal';
  }

  getGoalStatusClass(pagesRead: number): string {
    if (!this.readingGoal()) {
      return '';
    }
    if (pagesRead >= this.readingGoal()!.highGoal) {
      return 'text-red-500 font-bold';
    } else if (pagesRead >= this.readingGoal()!.mediumGoal) {
      return 'text-blue-500 font-bold';
    } else if (pagesRead >= this.readingGoal()!.lowGoal) {
      return 'text-green-500 font-bold';
    }
    return 'text-gray-500';
  }

  getPercentage(pagesRead: number): string {
    if (this.totalPages() && this.totalPages()! > 0) {
      const percentage = (pagesRead / this.totalPages()!) * 100;
      return percentage.toFixed(2) + '%';
    }
    return '0.00%';
  }

  viewEditNote(session: GetReadingSession): void {
    this.selectedSessionForNote = session;
    this.isNoteModalOpen = true;
  }

  handleNoteSaved(updatedSession: GetReadingSession): void {
    if (updatedSession.id) {
      const updateDto: UpdateReadingSession = {
        bookId: updatedSession.bookId,
        date: updatedSession.date,
        pagesRead: updatedSession.pagesRead,
        summary: updatedSession.summary
      };
      this.readingSessionService.updateReadingSession(updatedSession.id, updateDto).subscribe({
        next: (result) => {
          if (result.isSuccess) {

            this.notificationService.showSuccess('Note saved successfully');
            this.loadSessions(); // Refresh the list
            this.closeNoteModal();
          } else {

            this.notificationService.showError('Failed to save note');
          }
        },
        error: (err) => {

          this.notificationService.showError('Failed to save note');
        }
      });
    }
  }

  closeNoteModal(): void {
    this.isNoteModalOpen = false;
    this.selectedSessionForNote = null;
  }

  onClose(): void {
    this.close.emit();
  }
}
