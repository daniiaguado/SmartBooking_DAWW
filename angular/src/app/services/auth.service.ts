import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface AuthUser {
  id: number;
  email: string;
  roles: string[];
  displayName: string;
  initials: string;
  userType: string;
  isAdmin: boolean;
  isActive: boolean;
  nombre?: string;
  apellidos?: string;
  dni?: string;
  telefono?: string;
  nombreEmpresa?: string;
  cif?: string;
  sector?: string;
  telefonoEmpresa?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  get currentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  get isAdmin(): boolean {
    return this.currentUserSubject.value?.isAdmin ?? false;
  }

  get isEmpresa(): boolean {
    return this.currentUserSubject.value?.userType === 'empresa';
  }

  loadCurrentUser(): Observable<AuthUser> {
    return this.http
      .get<AuthUser>('/api/me', { withCredentials: true })
      .pipe(tap(user => this.currentUserSubject.next(user)));
  }

  login(email: string, password: string): Observable<{ success: boolean; user: AuthUser }> {
    return this.http.post<{ success: boolean; user: AuthUser }>(
      '/api/login',
      { email, password },
      { withCredentials: true }
    );
  }

  setCurrentUser(user: AuthUser): void {
    this.currentUserSubject.next(user);
  }

  logout(): void {
    this.http.post('/api/logout', {}, { withCredentials: true }).subscribe({
      complete: () => {
        this.currentUserSubject.next(null);
        this.router.navigate(['/app/login']);
      },
      error: () => {
        this.currentUserSubject.next(null);
        this.router.navigate(['/app/login']);
      },
    });
  }
}
