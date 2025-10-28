
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private apiUrl = `${environment.apiUrl}/notes`;

  constructor(private http: HttpClient) { }

  getNotes(bookId?: number, sessionId?: number): Observable<any[]> {
    let params: any = {};
    if (bookId) {
      params.bookId = bookId;
    }
    if (sessionId) {
      params.sessionId = sessionId;
    }
    return this.http.get<any[]>(this.apiUrl, { params });
  }

  addNote(note: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, note);
  }

  updateNote(id: number, note: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, note);
  }

  deleteNote(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
