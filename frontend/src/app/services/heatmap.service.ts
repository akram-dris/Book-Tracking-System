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

  getHeatmapData(year: number): Observable<{[key: string]: number}> {
    return this.http.get<{[key: string]: number}>(`${this.apiUrl}/${year}`);
  }
}