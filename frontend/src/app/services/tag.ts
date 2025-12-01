import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { GetTag } from '../models/get-tag.model';
import { CreateTag } from '../models/create-tag.model';
import { UpdateTag } from '../models/update-tag.model'; // New import
import { Result, PaginatedResult, PaginationParams } from '../models/result';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TagService {
  private apiUrl = `${environment.apiUrl}/tags`;

  constructor(private http: HttpClient) { }

  getTags(): Observable<Result<GetTag[]>> {
    return this.http.get<Result<GetTag[]>>(this.apiUrl);
  }

  getTagsPaginated(params: PaginationParams): Observable<Result<PaginatedResult<GetTag>>> {
    let httpParams = new HttpParams()
      .set('pageNumber', params.pageNumber.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }

    if (params.sort) {
      httpParams = httpParams.set('sort', params.sort);
    }

    return this.http.get<Result<PaginatedResult<GetTag>>>(`${this.apiUrl}/paginated`, { params: httpParams });
  }

  createTag(tag: CreateTag): Observable<Result<GetTag>> {
    return this.http.post<Result<GetTag>>(this.apiUrl, tag);
  }

  updateTag(id: number, tag: UpdateTag): Observable<Result<any>> {
    return this.http.put<Result<any>>(`${this.apiUrl}/${id}`, tag);
  }

  getTagUsageCounts(): Observable<Result<{ [key: number]: number }>> {
    return this.http.get<Result<{ [key: number]: number }>>(`${this.apiUrl}/usage`);
  }

  deleteTag(id: number): Observable<Result<any>> {
    return this.http.delete<Result<any>>(`${this.apiUrl}/${id}`);
  }

  getTagBookCount(id: number): Observable<Result<number>> {
    return this.http.get<Result<number>>(`${this.apiUrl}/${id}/book-count`);
  }
}