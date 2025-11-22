import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SearchResult } from '../models/search-result.model';

@Injectable({
    providedIn: 'root'
})
export class SearchService {
    private apiUrl = `${environment.apiUrl}/search`;

    constructor(private http: HttpClient) { }

    search(query: string): Observable<SearchResult> {
        return this.http.get<SearchResult>(`${this.apiUrl}?query=${encodeURIComponent(query)}`);
    }
}
