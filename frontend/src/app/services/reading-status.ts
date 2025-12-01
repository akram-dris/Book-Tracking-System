import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ReadingStatusInfo } from '../models/reading-status-info.model';
import { ReadingStatus } from '../models/enums/reading-status.enum';
import { Result } from '../models/result';

@Injectable({
  providedIn: 'root',
})
export class ReadingStatusService {
  private apiUrl = `${environment.apiUrl}/readingstatus`;
  private statusCache$: Observable<Result<ReadingStatusInfo[]>> | null = null;

  constructor(private http: HttpClient) { }

  getAllStatuses(): Observable<Result<ReadingStatusInfo[]>> {
    if (!this.statusCache$) {
      this.statusCache$ = this.http.get<Result<ReadingStatusInfo[]>>(this.apiUrl).pipe(
        map(result => {
          if (result.isSuccess && result.data) {

          }
          return result;
        }),
        shareReplay(1)
      );
    }
    return this.statusCache$;
  }

  getStatusInfo(status: ReadingStatus): Observable<ReadingStatusInfo | undefined> {
    return this.getAllStatuses().pipe(
      map(result => {
        if (result.isSuccess && result.data) {
          return result.data.find(s => s.value === status);
        }
        return undefined;
      })
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
