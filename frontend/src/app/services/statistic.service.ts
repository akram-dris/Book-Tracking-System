
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { 
  Statistics, 
  ReadingOverview, 
  AuthorStatistics, 
  TagStatistics, 
  TimeBasedStatistics, 
  GoalPerformance, 
  BookStatistics, 
  PersonalRecords 
} from '../models/statistics.model';

@Injectable({
  providedIn: 'root'
})
export class StatisticService {
  private apiUrl = `${environment.apiUrl}/statistics`;

  constructor(private http: HttpClient) { }

  getGlobalStats(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/stats`);
  }

  getReadingOverview(): Observable<ReadingOverview> {
    return this.http.get<ReadingOverview>(`${this.apiUrl}/overview`);
  }

  getAuthorStatistics(): Observable<AuthorStatistics> {
    return this.http.get<AuthorStatistics>(`${this.apiUrl}/authors`);
  }

  getTagStatistics(): Observable<TagStatistics> {
    return this.http.get<TagStatistics>(`${this.apiUrl}/tags`);
  }

  getTimeBasedStatistics(): Observable<TimeBasedStatistics> {
    return this.http.get<TimeBasedStatistics>(`${this.apiUrl}/time-based`);
  }

  getGoalPerformance(): Observable<GoalPerformance> {
    return this.http.get<GoalPerformance>(`${this.apiUrl}/goals`);
  }

  getBookStatistics(): Observable<BookStatistics> {
    return this.http.get<BookStatistics>(`${this.apiUrl}/books`);
  }

  getPersonalRecords(): Observable<PersonalRecords> {
    return this.http.get<PersonalRecords>(`${this.apiUrl}/records`);
  }

  getCompleteStatistics(): Observable<Statistics> {
    return this.http.get<Statistics>(`${this.apiUrl}/complete`);
  }
}
