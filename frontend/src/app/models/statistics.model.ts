export interface Statistics {
  overview: ReadingOverview;
  authors: AuthorStatistics;
  tags: TagStatistics;
  timeBased: TimeBasedStatistics;
  goals: GoalPerformance;
  books: BookStatistics;
  records: PersonalRecords;
}

export interface ReadingOverview {
  totalBooksRead: number;
  totalPagesRead: number;
  averagePagesPerDay: number;
  currentStreak: number;
  longestStreak: number;
  booksCurrentlyReading: number;
  booksPending: number;
}

export interface AuthorStatistics {
  totalAuthorsRead: number;
  mostReadAuthor: string | null;
  mostReadAuthorBookCount: number;
  authorDiversityScore: number;
  topAuthorsByBooks: AuthorBookCount[];
  authorsByPages: AuthorPages[];
}

export interface AuthorBookCount {
  authorId: number;
  authorName: string;
  bookCount: number;
}

export interface AuthorPages {
  authorId: number;
  authorName: string;
  totalPages: number;
}

export interface TagStatistics {
  totalTags: number;
  favoriteTag: string | null;
  favoriteTagBookCount: number;
  tagDiversityScore: number;
  topTagsByBooks: TagBookCount[];
  tagsByPages: TagPages[];
}

export interface TagBookCount {
  tagId: number;
  tagName: string;
  bookCount: number;
}

export interface TagPages {
  tagId: number;
  tagName: string;
  totalPages: number;
}

export interface TimeBasedStatistics {
  bestReadingMonth: string | null;
  bestReadingMonthPages: number;
  bestReadingDayOfWeek: string | null;
  bestReadingDayPages: number;
  monthlyTrend: { [key: string]: number };
  weeklyPattern: { [key: string]: number };
  yearOverYear: { [key: number]: number };
  statusTimeline: { [key: string]: StatusTimelineData };
}

export interface StatusTimelineData {
  completed: { [key: string]: number };
  summarized: { [key: string]: number };
  currentlyReading: { [key: string]: number };
  planning: { [key: string]: number };
  notReading: { [key: string]: number };
}

export interface GoalPerformance {
  overallCompletionRate: number;
  lowGoalSuccessCount: number;
  mediumGoalSuccessCount: number;
  highGoalSuccessCount: number;
  averageDaysToComplete: number;
  booksCompletedOnTime: number;
  booksOverdue: number;
  currentGoalsProgress: CurrentGoalProgress[];
}

export interface CurrentGoalProgress {
  bookId: number;
  bookTitle: string;
  bookStatus: string;
  lowGoal: number;
  mediumGoal: number;
  highGoal: number;
  currentPages: number;
  lowProgress: number;
  mediumProgress: number;
  highProgress: number;
}

export interface BookStatistics {
  averageBookLength: number;
  shortestBook: BookInfo | null;
  longestBook: BookInfo | null;
  averageReadingSpeed: number;
  completionRate: number;
  booksByStatus: { [key: string]: number };
}

export interface BookInfo {
  id: number;
  title: string;
  totalPages: number;
  authorName: string | null;
}

export interface PersonalRecords {
  mostPagesInDay: RecordDetail | null;
  mostPagesInWeek: RecordDetail | null;
  mostPagesInMonth: RecordDetail | null;
  fastestBookCompletion: FastestCompletion | null;
  totalReadingDays: number;
}

export interface RecordDetail {
  pages: number;
  date: string;
}

export interface FastestCompletion {
  bookId: number;
  bookTitle: string;
  days: number;
  startDate: string | null;
  completedDate: string | null;
}

export interface StatisticsFilter {
  filterType: 'day' | 'week' | 'month' | 'year' | 'custom';
  startDate?: string;
  endDate?: string;
}
