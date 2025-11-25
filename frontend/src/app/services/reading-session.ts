import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GetReadingSession } from '../models/get-reading-session.model';
import { CreateReadingSession } from '../models/create-reading-session.model';
import { UpdateReadingSession } from '../models/update-reading-session.model';
import { Result } from '../models/result';

@Injectable({
  providedIn: 'root'
})
export class ReadingSessionService {
  private apiUrl = `${environment.apiUrl}/readingsessions`;

  constructor(private http: HttpClient) { }

  getReadingSessionsForBook(bookId: number): Observable<Result<GetReadingSession[]>> {
    console.log(`Fetching reading sessions for bookId: ${bookId}`);
    return this.http.get<Result<GetReadingSession[]>>(`${this.apiUrl}/book/${bookId}`);
  }

  getReadingSession(id: number): Observable<Result<GetReadingSession>> {
    return this.http.get<Result<GetReadingSession>>(`${this.apiUrl}/${id}`);
  }

  addReadingSession(readingSession: CreateReadingSession): Observable<Result<GetReadingSession>> {
    return this.http.post<Result<GetReadingSession>>(this.apiUrl, readingSession);
  }

  updateReadingSession(id: number, readingSession: UpdateReadingSession): Observable<Result<any>> {
    return this.http.put<Result<any>>(`${this.apiUrl}/${id}`, readingSession);
  }

  deleteReadingSession(id: number): Observable<Result<any>> {
    console.log(`Deleting reading session with ID: ${id}`);
    return this.http.delete<Result<any>>(`${this.apiUrl}/${id}`);
  }
}