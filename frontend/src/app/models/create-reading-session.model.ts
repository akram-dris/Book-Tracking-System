export interface CreateReadingSession {
  bookId: number;
  date: Date; // Changed from sessionDate to date
  pagesRead: number;
  summary?: string; // New property for session notes
}
