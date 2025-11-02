import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GetReadingGoal } from '../../models/get-reading-goal.model';
import { GetReadingSession } from '../../models/get-reading-session.model';
import { ReadingSessionService } from '../../services/reading-session.service';
import { ReadingStatus } from '../../models/enums/reading-status.enum'; // New import

@Component({
  selector: 'app-reading-log-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reading-log-modal.component.html',
  styleUrls: ['./reading-log-modal.component.css']
})
export class ReadingLogModalComponent implements OnInit {
  @Input() bookId: number | null = null;
  @Input() readingGoal: GetReadingGoal | null = null;
  @Input() totalPages: number | null = null;
  @Input() bookStatus: ReadingStatus | null = null; // New input
  @Output() close = new EventEmitter<void>();
  @Output() sessionDeleted = new EventEmitter<void>(); // New output event

  ReadingStatus = ReadingStatus; // Expose enum to template

  readingSessions: GetReadingSession[] = [];
  isLoading = false;

  constructor(private readingSessionService: ReadingSessionService) { }

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    if (this.bookId) {
      this.isLoading = true;
      console.log('Loading sessions for bookId:', this.bookId);
      this.readingSessionService.getReadingSessionsForBook(this.bookId).subscribe({
        next: (sessions) => {
          console.log('Sessions fetched:', sessions);
          this.readingSessions = sessions;
          console.log('readingSessions after update:', this.readingSessions);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching reading sessions for log modal:', err);
          this.isLoading = false;
        }
      });
    }
  }

  deleteSession(sessionId: number): void {
    if (confirm('Are you sure you want to delete this reading session?')) {
      console.log('Attempting to delete session with ID:', sessionId);
      this.readingSessionService.deleteReadingSession(sessionId).subscribe({
        next: () => {
          console.log('Reading session deleted successfully. Reloading sessions...');
          this.loadSessions(); // Refresh the list after deletion
          this.sessionDeleted.emit(); // Emit event to notify parent
        },
        error: (err) => {
          console.error('Error deleting reading session:', err);
        }
      });
    }
  }

  getGoalStatus(pagesRead: number): string {
    if (!this.readingGoal) {
      return 'N/A';
    }
    if (pagesRead >= this.readingGoal.highGoal) {
      return 'High';
    } else if (pagesRead >= this.readingGoal.mediumGoal) {
      return 'Medium';
    } else if (pagesRead >= this.readingGoal.lowGoal) {
      return 'Low';
    }
    return 'Below Goal';
  }

  getGoalStatusClass(pagesRead: number): string {
    if (!this.readingGoal) {
      return '';
    }
    if (pagesRead >= this.readingGoal.highGoal) {
      return 'text-red-500 font-bold';
    } else if (pagesRead >= this.readingGoal.mediumGoal) {
      return 'text-blue-500 font-bold';
    } else if (pagesRead >= this.readingGoal.lowGoal) {
      return 'text-green-500 font-bold';
    }
    return 'text-gray-500';
  }

  getPercentage(pagesRead: number): string {
    if (this.totalPages && this.totalPages > 0) {
      const percentage = (pagesRead / this.totalPages) * 100;
      return percentage.toFixed(2) + '%';
    }
    return '0.00%';
  }

  onClose(): void {
    this.close.emit();
  }
}
