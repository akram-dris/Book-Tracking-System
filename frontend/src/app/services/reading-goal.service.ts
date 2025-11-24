import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GetReadingGoal } from '../models/get-reading-goal.model';
import { CreateReadingGoal } from '../models/create-reading-goal.model';
import { UpdateReadingGoal } from '../models/update-reading-goal.model';
import { Result } from '../models/result';

@Injectable({
  providedIn: 'root'
})
export class ReadingGoalService {
  private apiUrl = `${environment.apiUrl}/readinggoals`;

  constructor(private http: HttpClient) { }

  getReadingGoalForBook(bookId: number): Observable<Result<GetReadingGoal>> {
    return this.http.get<Result<GetReadingGoal>>(`${this.apiUrl}/${bookId}`);
  }

  addReadingGoal(readingGoal: CreateReadingGoal): Observable<Result<GetReadingGoal>> {
    return this.http.post<Result<GetReadingGoal>>(this.apiUrl, readingGoal);
  }

  updateReadingGoal(bookId: number, readingGoal: UpdateReadingGoal): Observable<Result<any>> {
    return this.http.put<Result<any>>(`${this.apiUrl}/${bookId}`, readingGoal);
  }
}
