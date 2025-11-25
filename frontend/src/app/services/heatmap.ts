import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Result } from '../models/result';

@Injectable({
  providedIn: 'root'
})
export class HeatmapService {
  private apiUrl = `${environment.apiUrl}/heatmap`;

  constructor(private http: HttpClient) { }

  getHeatmapData(year: number): Observable<Result<{ [key: string]: number }>> {
    return this.http.get<Result<{ [key: string]: number }>>(`${this.apiUrl}/${year}`);
  }
}