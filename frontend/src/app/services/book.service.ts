
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GetBook } from '../models/get-book.model';
import { CreateBook } from '../models/create-book.model';
import { UpdateBook } from '../models/update-book.model';
import { ReadingStatus } from '../models/enums/reading-status.enum';
import { Result, PaginatedResult } from '../models/result';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = `${environment.apiUrl}/books`;

  constructor(private http: HttpClient) { }

  getBooks(tagId: number | null = null, search: string | null = null): Observable<GetBook[]> {
    let url = this.apiUrl;
    const params: string[] = [];
    if (tagId) {
      params.push(`tagId=${tagId}`);
    }
    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    return this.http.get<GetBook[]>(url);
  }

  getBooksPaginated(
    pageNumber: number,
    pageSize: number,
    search: string | null = null,
    tagId: number | null = null,
    statusFilter: number | null = null,
    sort: string | null = null,
    authorId: number | null = null,
    rating: number | null = null
  ): Observable<Result<PaginatedResult<GetBook>>> {
    let url = `${this.apiUrl}/paginated?pageNumber=${pageNumber}&pageSize=${pageSize}`;

    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    if (tagId) {
      url += `&tagId=${tagId}`;
    }
    if (statusFilter !== null) {
      url += `&statusFilter=${statusFilter}`;
    }
    if (sort) {
      url += `&sort=${sort}`;
    }
    if (authorId !== null) {
      url += `&authorId=${authorId}`;
    }
    if (rating !== null) {
      url += `&rating=${rating}`;
    }

    return this.http.get<Result<PaginatedResult<GetBook>>>(url);
  }

  getBookCountsByStatus(): Observable<{ [key: number]: number }> {
    return this.http.get<{ [key: number]: number }>(`${this.apiUrl}/counts-by-status`);
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
    formData.append('id', id.toString());
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

  updateBookStatus(bookId: number, status: ReadingStatus, startedReadingDate?: Date, completedDate?: Date, summary?: string, rating?: number): Observable<any> {
    const body: any = { status: status };
    if (startedReadingDate) {
      body.startedReadingDate = startedReadingDate instanceof Date ? startedReadingDate.toISOString() : startedReadingDate;
    }
    if (completedDate) {
      body.completedDate = completedDate instanceof Date ? completedDate.toISOString() : completedDate;
    }
    if (summary) {
      body.summary = summary;
    }
    if (rating !== undefined && rating !== null) {
      body.rating = rating;
    }
    console.log('BookService updateBookStatus payload:', JSON.stringify(body, null, 2));
    return this.http.put<any>(`${this.apiUrl}/${bookId}/status`, body);
  }

  updateBookSummary(bookId: number, summary: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${bookId}/summary`, { summary });
  }
}
