import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Recommendation } from '../models/recommendation.model';
import { Result } from '../models/result';

@Injectable({
    providedIn: 'root'
})
export class RecommendationService {
    private apiUrl = `${environment.apiUrl}/recommendations`;

    constructor(private http: HttpClient) { }

    getRecommendations(): Observable<Result<Recommendation[]>> {
        return this.http.get<Result<Recommendation[]>>(this.apiUrl);
    }
}
