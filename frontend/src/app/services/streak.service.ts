import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Streak } from '../models/streak.model';

@Injectable({
  providedIn: 'root'
})
export class StreakService {
  private apiUrl = `${environment.apiUrl}/streak`;

  constructor(private http: HttpClient) { }

  getStreakData(): Observable<Streak> {
    return this.http.get<Streak>(this.apiUrl);
  }
}