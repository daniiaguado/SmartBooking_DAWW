import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = '/api';

  constructor(private http: HttpClient) {}

  get<T>(path: string, params?: Record<string, string | number>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== '') {
          httpParams = httpParams.set(k, String(v));
        }
      });
    }
    return this.http
      .get<T>(`${this.baseUrl}${path}`, { params: httpParams, withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .post<T>(`${this.baseUrl}${path}`, body, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .put<T>(`${this.baseUrl}${path}`, body, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  delete<T>(path: string): Observable<T> {
    return this.http
      .delete<T>(`${this.baseUrl}${path}`, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'Error desconocido';
    if (error.status === 403) {
      message = 'No tienes permiso para acceder a esta reserva';
    } else if (error.error?.error) {
      message = error.error.error;
    } else if (error.error?.message) {
      message = error.error.message;
    } else if (error.error?.detail) {
      message = error.error.detail;
    } else if (error.error?.errors?.length) {
      message = error.error.errors.join(', ');
    } else if (error.message) {
      message = error.message;
    }
    return throwError(() => new Error(message));
  }
}
