
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GetBook } from '../models/get-book.model';
import { CreateBook } from '../models/create-book.model';
import { UpdateBook } from '../models/update-book.model';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = `${environment.apiUrl}/books`;

  constructor(private http: HttpClient) { }

  getBooks(tagId: number | null = null): Observable<GetBook[]> {
    let url = this.apiUrl;
    if (tagId) {
      url += `?tagId=${tagId}`;
    }
    return this.http.get<GetBook[]>(url);
  }

  getBook(id: number): Observable<GetBook> {
    return this.http.get<GetBook>(`${this.apiUrl}/${id}`);
  }

  addBook(book: CreateBook): Observable<GetBook> {
    const formData = new FormData();
    formData.append('authorId', book.authorId.toString());
    formData.append('title', book.title);
    formData.append('totalPages', book.totalPages.toString());
    if (book.imageFile) {
      formData.append('imageFile', book.imageFile, book.imageFile.name);
    }
    return this.http.post<GetBook>(this.apiUrl, formData);
  }

  updateBook(id: number, book: UpdateBook): Observable<any> {
    const formData = new FormData();
    formData.append('id', book.id.toString());
    formData.append('authorId', book.authorId.toString());
    formData.append('title', book.title);
    formData.append('totalPages', book.totalPages.toString());
    if (book.imageFile) {
      formData.append('imageFile', book.imageFile, book.imageFile.name);
    }
    return this.http.put<any>(`${this.apiUrl}/${id}`, formData);
  }

  deleteBook(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  assignTags(bookId: number, tagIds: number[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${bookId}/tags`, tagIds);
  }
}
