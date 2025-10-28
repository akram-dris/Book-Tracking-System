
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TagService {
  private apiUrl = `${environment.apiUrl}/tags`;

  constructor(private http: HttpClient) { }

  getTags(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getTag(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  addTag(tag: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, tag);
  }

  updateTag(id: number, tag: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, tag);
  }

  deleteTag(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  assignTagsToBook(bookId: number, tagIds: number[]): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/books/${bookId}/tags`, { tagIds });
  }
}
