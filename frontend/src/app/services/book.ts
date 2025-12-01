
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

  getBooks(tagId: number | null = null, search: string | null = null): Observable<Result<GetBook[]>> {
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
    return this.http.get<Result<GetBook[]>>(url);
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

  getBookCountsByStatus(): Observable<Result<{ [key: number]: number }>> {
    return this.http.get<Result<{ [key: number]: number }>>(`${this.apiUrl}/status-counts`);
  }

  getBook(id: number): Observable<Result<GetBook>> {
    return this.http.get<Result<GetBook>>(`${this.apiUrl}/${id}`);
  }

  addBook(book: CreateBook): Observable<Result<GetBook>> {
    const formData = new FormData();
    formData.append('authorId', book.authorId.toString());
    formData.append('title', book.title);
    formData.append('totalPages', book.totalPages.toString());
    if (book.imageFile) {
      formData.append('imageFile', book.imageFile, book.imageFile.name);
    }
    return this.http.post<Result<GetBook>>(this.apiUrl, formData);
  }

  updateBook(id: number, book: UpdateBook): Observable<Result<any>> {
    const formData = new FormData();
    formData.append('id', id.toString());
    formData.append('authorId', book.authorId.toString());
    formData.append('title', book.title);
    formData.append('totalPages', book.totalPages.toString());
    if (book.imageFile) {
      formData.append('imageFile', book.imageFile, book.imageFile.name);
    }
    return this.http.put<Result<any>>(`${this.apiUrl}/${id}`, formData);
  }

  deleteBook(id: number): Observable<Result<any>> {
    return this.http.delete<Result<any>>(`${this.apiUrl}/${id}`);
  }

  assignTags(bookId: number, tagIds: number[]): Observable<Result<any>> {
    return this.http.post<Result<any>>(`${this.apiUrl}/${bookId}/tags`, tagIds);
  }

  updateBookStatus(bookId: number, status: ReadingStatus, startedReadingDate?: Date, completedDate?: Date, summary?: string, rating?: number): Observable<Result<any>> {
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

    return this.http.put<Result<any>>(`${this.apiUrl}/${bookId}/status`, body);
  }

  updateBookSummary(bookId: number, summary: string): Observable<Result<any>> {
    return this.http.put<Result<any>>(`${this.apiUrl}/${bookId}/summary`, { summary });
  }
}
