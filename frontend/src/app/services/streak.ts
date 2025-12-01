import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject, switchMap, tap, startWith } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Streak } from '../models/streak.model';
import { Result } from '../models/result';

@Injectable({
  providedIn: 'root'
})
export class StreakService {
  private apiUrl = `${environment.apiUrl}/streak`;
  private reload$ = new ReplaySubject<void>(1);
  private streakData$: Observable<Result<Streak>>;

  constructor(private http: HttpClient) {
    this.reload$.next(); // Initial load
    this.streakData$ = this.reload$.pipe(
      startWith(null), // Start the stream immediately
      switchMap(() => {
        const d = new Date();
        const localDate = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        return this.http.get<Result<Streak>>(`${this.apiUrl}?localDate=${localDate}`);
      }),

    );
  }

  getStreakData(): Observable<Result<Streak>> {
    return this.streakData$;
  }

  forceReload(): void {

    this.reload$.next();
  }
}