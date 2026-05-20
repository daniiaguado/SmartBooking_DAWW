import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Empresa {
  id: number;
  nombreEmpresa: string;
  cif: string;
  sector: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  searchEmpresas(q: string): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(
      `/users/search-empresas?q=${encodeURIComponent(q)}`,
      { withCredentials: true }
    );
  }

  getEmpresa(id: number): Observable<Empresa> {
    return this.http.get<Empresa>(`/users/${id}`, { withCredentials: true });
  }
}
