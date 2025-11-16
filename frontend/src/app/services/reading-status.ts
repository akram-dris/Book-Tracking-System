import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ReadingStatusInfo } from '../models/reading-status-info.model';
import { ReadingStatus } from '../models/enums/reading-status.enum';

@Injectable({
  providedIn: 'root',
})
export class ReadingStatusService {
  private apiUrl = `${environment.apiUrl}/readingstatus`;
  private statusCache$: Observable<ReadingStatusInfo[]> | null = null;

  constructor(private http: HttpClient) {}

  getAllStatuses(): Observable<ReadingStatusInfo[]> {
    if (!this.statusCache$) {
      this.statusCache$ = this.http.get<ReadingStatusInfo[]>(this.apiUrl).pipe(
        map(statuses => {
          console.log('🎨 STATUS COLORS FROM BACKEND:', statuses);
          return statuses;
        }),
        shareReplay(1)
      );
    }
    return this.statusCache$;
  }

  getStatusInfo(status: ReadingStatus): Observable<ReadingStatusInfo | undefined> {
    return this.getAllStatuses().pipe(
      map(statuses => statuses.find(s => s.value === status))
    );
  }

  getStatusDisplayName(status: ReadingStatus): Observable<string> {
    return this.getStatusInfo(status).pipe(
      map(info => info?.displayName || 'Unknown')
    );
  }

  getStatusBadgeClass(status: ReadingStatus): Observable<string> {
    return this.getStatusInfo(status).pipe(
      map(info => info?.badgeClass || 'badge-ghost')
    );
  }
}
