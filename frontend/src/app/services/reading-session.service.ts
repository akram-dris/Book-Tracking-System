import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GetReadingSession } from '../models/get-reading-session.model';
import { CreateReadingSession } from '../models/create-reading-session.model';
import { UpdateReadingSession } from '../models/update-reading-session.model';

@Injectable({
  providedIn: 'root'
})
export class ReadingSessionService {
  private apiUrl = `${environment.apiUrl}/readingsessions`;

  constructor(private http: HttpClient) { }

  getReadingSessionsForBook(bookId: number): Observable<GetReadingSession[]> {
    console.log(`Fetching reading sessions for bookId: ${bookId}`);
    return this.http.get<GetReadingSession[]>(`${this.apiUrl}/book/${bookId}`);
  }

  getReadingSession(id: number): Observable<GetReadingSession> {
    return this.http.get<GetReadingSession>(`${this.apiUrl}/${id}`);
  }

  addReadingSession(readingSession: CreateReadingSession): Observable<GetReadingSession> {
    return this.http.post<GetReadingSession>(this.apiUrl, readingSession);
  }

  updateReadingSession(id: number, readingSession: UpdateReadingSession): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, readingSession);
  }

  deleteReadingSession(id: number): Observable<any> {
    console.log(`Deleting reading session with ID: ${id}`);
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}