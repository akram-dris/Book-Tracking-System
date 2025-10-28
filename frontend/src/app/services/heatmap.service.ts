
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HeatmapService {
  private apiUrl = `${environment.apiUrl}/heatmap`;

  constructor(private http: HttpClient) { }

  getHeatmapData(year?: number, bookId?: number, tagId?: number, targetId?: number): Observable<any> {
    let params: any = {};
    if (year) {
      params.year = year;
    }
    if (bookId) {
      params.bookId = bookId;
    }
    if (tagId) {
      params.tagId = tagId;
    }
    if (targetId) {
      params.targetId = targetId;
    }
    return this.http.get<any>(this.apiUrl, { params });
  }
}
