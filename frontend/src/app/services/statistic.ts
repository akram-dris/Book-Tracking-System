
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
import { Result } from '../models/result';

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


  getReadingOverview(filter?: StatisticsFilter): Observable<Result<ReadingOverview>> {
    const params = this.buildFilterParams(filter);
    return this.http.get<Result<ReadingOverview>>(`${this.apiUrl}/overview`, { params });
  }

  getAuthorStatistics(filter?: StatisticsFilter): Observable<Result<AuthorStatistics>> {
    const params = this.buildFilterParams(filter);
    return this.http.get<Result<AuthorStatistics>>(`${this.apiUrl}/authors`, { params });
  }

  getTagStatistics(filter?: StatisticsFilter): Observable<Result<TagStatistics>> {
    const params = this.buildFilterParams(filter);
    return this.http.get<Result<TagStatistics>>(`${this.apiUrl}/tags`, { params });
  }

  getTimeBasedStatistics(filter?: StatisticsFilter): Observable<Result<TimeBasedStatistics>> {
    const params = this.buildFilterParams(filter);
    return this.http.get<Result<TimeBasedStatistics>>(`${this.apiUrl}/time-based`, { params });
  }

  getGoalPerformance(filter?: StatisticsFilter): Observable<Result<GoalPerformance>> {
    const params = this.buildFilterParams(filter);
    return this.http.get<Result<GoalPerformance>>(`${this.apiUrl}/goals`, { params });
  }

  getBookStatistics(filter?: StatisticsFilter): Observable<Result<BookStatistics>> {
    const params = this.buildFilterParams(filter);
    return this.http.get<Result<BookStatistics>>(`${this.apiUrl}/books`, { params });
  }

  getPersonalRecords(filter?: StatisticsFilter): Observable<Result<PersonalRecords>> {
    const params = this.buildFilterParams(filter);
    return this.http.get<Result<PersonalRecords>>(`${this.apiUrl}/records`, { params });
  }

  getCompleteStatistics(filter?: StatisticsFilter): Observable<Result<Statistics>> {
    const params = this.buildFilterParams(filter);
    return this.http.get<Result<Statistics>>(`${this.apiUrl}/complete`, { params });
  }
}
