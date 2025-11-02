export interface GetReadingSession {
  id: number;
  bookId: number;
  date: Date; // Changed from sessionDate to date
  pagesRead: number;
}
