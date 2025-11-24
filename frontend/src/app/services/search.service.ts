import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SearchResult } from '../models/search-result.model';
import { Result } from '../models/result';

@Injectable({
    providedIn: 'root'
})
export class SearchService {
    private apiUrl = `${environment.apiUrl}/search`;

    constructor(private http: HttpClient) { }

    search(query: string): Observable<Result<SearchResult>> {
        return this.http.get<Result<SearchResult>>(`${this.apiUrl}?query=${encodeURIComponent(query)}`);
    }
}
