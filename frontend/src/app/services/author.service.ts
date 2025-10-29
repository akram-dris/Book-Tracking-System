
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GetAuthor } from '../models/get-author.model';
import { CreateAuthor } from '../models/create-author.model';
import { UpdateAuthor } from '../models/update-author.model';

@Injectable({
  providedIn: 'root'
})
export class AuthorService {
  private apiUrl = `${environment.apiUrl}/authors`;

  constructor(private http: HttpClient) { }

  getAuthors(): Observable<GetAuthor[]> {
    return this.http.get<GetAuthor[]>(this.apiUrl);
  }

  getAuthor(id: number): Observable<GetAuthor> {
    return this.http.get<GetAuthor>(`${this.apiUrl}/${id}`);
  }

  addAuthor(author: CreateAuthor): Observable<GetAuthor> {
    const formData = new FormData();
    formData.append('name', author.name);
    if (author.bio) {
      formData.append('bio', author.bio);
    }
    if (author.imageFile) {
      formData.append('imageFile', author.imageFile, author.imageFile.name);
    }
    return this.http.post<GetAuthor>(this.apiUrl, formData);
  }

  updateAuthor(id: number, author: UpdateAuthor): Observable<any> {
    const formData = new FormData();
    formData.append('name', author.name);
    if (author.bio) {
      formData.append('bio', author.bio);
    }
    if (author.imageFile) {
      formData.append('imageFile', author.imageFile, author.imageFile.name);
    }
    return this.http.put<any>(`${this.apiUrl}/${id}`, formData);
  }

  deleteAuthor(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
