
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReadingProgressService {
  private apiUrl = `${environment.apiUrl}/progress`;

  constructor(private http: HttpClient) { }

  updateReadingProgress(id: number, progress: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, progress);
  }
}
