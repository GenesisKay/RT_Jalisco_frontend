import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EstadisticasService {

  private apiUrl = 'https://berzsi9eu7.execute-api.us-east-2.amazonaws.com/prod';

  constructor(private http: HttpClient) {}

  getStatistics(yearStart: number, monthStart: number, yearEnd: number, monthEnd: number, transporte: string): Observable<any[]> {
    const url = `${this.apiUrl}/estadisticas?yearStart=${yearStart}&monthStart=${monthStart}&yearEnd=${yearEnd}&monthEnd=${monthEnd}&transporte=${transporte}`;
    return this.http.get<any[]>(url);
  }
}