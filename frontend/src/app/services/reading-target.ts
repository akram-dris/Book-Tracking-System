
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReadingTargetService {
  private apiUrl = `${environment.apiUrl}/targets`;

  constructor(private http: HttpClient) { }

  getReadingTargets(bookId?: number): Observable<any[]> {
    let params: any = {};
    if (bookId) {
      params.bookId = bookId;
    }
    return this.http.get<any[]>(this.apiUrl, { params });
  }

  addReadingTarget(target: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, target);
  }
}
