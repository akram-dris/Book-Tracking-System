
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GetAuthor } from '../models/get-author.model';
import { CreateAuthor } from '../models/create-author.model';
import { UpdateAuthor } from '../models/update-author.model';
import { Result, PaginatedResult, PaginationParams } from '../models/result';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthorService {
  private apiUrl = `${environment.apiUrl}/authors`;

  constructor(private http: HttpClient) { }

  getAuthors(): Observable<Result<GetAuthor[]>> {
    return this.http.get<Result<GetAuthor[]>>(this.apiUrl);
  }

  getAuthorsPaginated(params: PaginationParams): Observable<Result<PaginatedResult<GetAuthor>>> {
    let httpParams = new HttpParams()
      .set('pageNumber', params.pageNumber.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }

    if (params.sort) {
      httpParams = httpParams.set('sort', params.sort);
    }

    return this.http.get<Result<PaginatedResult<GetAuthor>>>(`${this.apiUrl}/paginated`, { params: httpParams });
  }

  getAuthor(id: number): Observable<Result<GetAuthor>> {
    return this.http.get<Result<GetAuthor>>(`${this.apiUrl}/${id}`);
  }

  addAuthor(author: CreateAuthor): Observable<Result<GetAuthor>> {
    const formData = new FormData();
    formData.append('name', author.name);
    if (author.bio) {
      formData.append('bio', author.bio);
    }
    if (author.imageFile) {
      formData.append('imageFile', author.imageFile, author.imageFile.name);
    }
    return this.http.post<Result<GetAuthor>>(this.apiUrl, formData);
  }

  updateAuthor(id: number, author: UpdateAuthor): Observable<Result<any>> {
    const formData = new FormData();
    formData.append('name', author.name);
    if (author.bio) {
      formData.append('bio', author.bio);
    }
    if (author.imageFile) {
      formData.append('imageFile', author.imageFile, author.imageFile.name);
    }
    return this.http.put<Result<any>>(`${this.apiUrl}/${id}`, formData);
  }

  deleteAuthor(id: number): Observable<Result<any>> {
    return this.http.delete<Result<any>>(`${this.apiUrl}/${id}`);
  }
}
