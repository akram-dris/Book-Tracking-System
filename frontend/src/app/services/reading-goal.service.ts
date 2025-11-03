import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GetReadingGoal } from '../models/get-reading-goal.model';
import { CreateReadingGoal } from '../models/create-reading-goal.model';
import { UpdateReadingGoal } from '../models/update-reading-goal.model';

@Injectable({
  providedIn: 'root'
})
export class ReadingGoalService {
  private apiUrl = `${environment.apiUrl}/readinggoals`;

  constructor(private http: HttpClient) { }

  getReadingGoalForBook(bookId: number): Observable<GetReadingGoal> {
    return this.http.get<GetReadingGoal>(`${this.apiUrl}/${bookId}`);
  }

  addReadingGoal(readingGoal: CreateReadingGoal): Observable<GetReadingGoal> {
    return this.http.post<GetReadingGoal>(this.apiUrl, readingGoal);
  }

  updateReadingGoal(bookId: number, readingGoal: UpdateReadingGoal): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${bookId}`, readingGoal);
  }
}
