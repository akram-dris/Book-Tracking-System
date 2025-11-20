import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject, switchMap, tap, startWith } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Streak } from '../models/streak.model';

@Injectable({
  providedIn: 'root'
})
export class StreakService {
  private apiUrl = `${environment.apiUrl}/streak`;
  private reload$ = new ReplaySubject<void>(1);
  private streakData$: Observable<Streak>;

  constructor(private http: HttpClient) {
    this.reload$.next(); // Initial load
    this.streakData$ = this.reload$.pipe(
      startWith(null), // Start the stream immediately
      switchMap(() => this.http.get<Streak>(this.apiUrl)),
      tap(data => console.log("Streak data loaded: ", data))
    );
  }

  getStreakData(): Observable<Streak> {
    return this.streakData$;
  }

  forceReload(): void {
    console.log("Streak data reload triggered");
    this.reload$.next();
  }
}