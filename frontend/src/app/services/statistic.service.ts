
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
  PersonalRecords,
  StatisticsFilter 
} from '../models/statistics.model';

@Injectable({
  providedIn: 'root'
})
export class StatisticService {
  private apiUrl = `${environment.apiUrl}/statistics`;

  constructor(private http: HttpClient) { }

  private buildFilterParams(filter?: StatisticsFilter): HttpParams {
    let params = new HttpParams();
    
    if (filter) {
      params = params.set('filterType', filter.filterType);
      
      if (filter.filterType === 'custom' && filter.startDate && filter.endDate) {
        params = params.set('startDate', filter.startDate);
        params = params.set('endDate', filter.endDate);
      }
    }
    
    return params;
  }

  getGlobalStats(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/stats`);
  }

  getReadingOverview(filter?: StatisticsFilter): Observable<ReadingOverview> {
    const params = this.buildFilterParams(filter);
    return this.http.get<ReadingOverview>(`${this.apiUrl}/overview`, { params });
  }

  getAuthorStatistics(filter?: StatisticsFilter): Observable<AuthorStatistics> {
    const params = this.buildFilterParams(filter);
    return this.http.get<AuthorStatistics>(`${this.apiUrl}/authors`, { params });
  }

  getTagStatistics(filter?: StatisticsFilter): Observable<TagStatistics> {
    const params = this.buildFilterParams(filter);
    return this.http.get<TagStatistics>(`${this.apiUrl}/tags`, { params });
  }

  getTimeBasedStatistics(filter?: StatisticsFilter): Observable<TimeBasedStatistics> {
    const params = this.buildFilterParams(filter);
    return this.http.get<TimeBasedStatistics>(`${this.apiUrl}/time-based`, { params });
  }

  getGoalPerformance(filter?: StatisticsFilter): Observable<GoalPerformance> {
    const params = this.buildFilterParams(filter);
    return this.http.get<GoalPerformance>(`${this.apiUrl}/goals`, { params });
  }

  getBookStatistics(filter?: StatisticsFilter): Observable<BookStatistics> {
    const params = this.buildFilterParams(filter);
    return this.http.get<BookStatistics>(`${this.apiUrl}/books`, { params });
  }

  getPersonalRecords(filter?: StatisticsFilter): Observable<PersonalRecords> {
    const params = this.buildFilterParams(filter);
    return this.http.get<PersonalRecords>(`${this.apiUrl}/records`, { params });
  }

  getCompleteStatistics(filter?: StatisticsFilter): Observable<Statistics> {
    const params = this.buildFilterParams(filter);
    return this.http.get<Statistics>(`${this.apiUrl}/complete`, { params });
  }
}
