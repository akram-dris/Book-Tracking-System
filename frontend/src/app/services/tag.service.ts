import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { GetTag } from '../models/get-tag.model';
import { CreateTag } from '../models/create-tag.model';

@Injectable({
  providedIn: 'root'
})
export class TagService {
  private apiUrl = `${environment.apiUrl}/tags`;

  constructor(private http: HttpClient) { }

  getTags(): Observable<GetTag[]> {
    return this.http.get<GetTag[]>(this.apiUrl);
  }

  createTag(tag: CreateTag): Observable<GetTag> {
    return this.http.post<GetTag>(this.apiUrl, tag);
  }

  getTagUsageCounts(): Observable<{ [key: number]: number }> {
    return this.http.get<{ [key: number]: number }>(`${this.apiUrl}/usage`);
  }

  deleteTag(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}