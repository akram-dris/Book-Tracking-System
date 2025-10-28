
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReadingSessionService {
  private apiUrl = `${environment.apiUrl}/sessions`;

  constructor(private http: HttpClient) { }

  getReadingSessions(bookId?: number, start?: string, end?: string): Observable<any[]> {
    let params: any = {};
    if (bookId) {
      params.bookId = bookId;
    }
    if (start) {
      params.start = start;
    }
    if (end) {
      params.end = end;
    }
    return this.http.get<any[]>(this.apiUrl, { params });
  }

  getReadingSession(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  addReadingSession(session: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, session);
  }

  updateReadingSession(id: number, session: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, session);
  }

  deleteReadingSession(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
