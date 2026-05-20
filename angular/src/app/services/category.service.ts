import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Category {
  id: number;
  nombre: string;
  descripcion?: string;
  color: string;
  totalRecursos: number;
}

export interface CategoryPayload {
  nombre: string;
  descripcion?: string;
  color?: string;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  constructor(private api: ApiService) {}

  getAll(): Observable<Category[]> {
    return this.api.get<Category[]>('/categories');
  }

  getOne(id: number): Observable<Category> {
    return this.api.get<Category>(`/categories/${id}`);
  }

  create(payload: CategoryPayload): Observable<Category> {
    return this.api.post<Category>('/categories', payload);
  }

  update(id: number, payload: Partial<CategoryPayload>): Observable<Category> {
    return this.api.put<Category>(`/categories/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/categories/${id}`);
  }
}
