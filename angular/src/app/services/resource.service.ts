import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Resource {
  id: number;
  nombre: string;
  descripcion?: string;
  capacidad: number;
  ubicacion?: string;
  precioHora: string;
  isActive: boolean;
  category?: { id: number; nombre: string; color: string };
}

export interface ResourcePayload {
  nombre: string;
  descripcion?: string;
  capacidad?: number;
  ubicacion?: string;
  precioHora?: string;
  isActive?: boolean;
  categoryId?: number;
}

@Injectable({ providedIn: 'root' })
export class ResourceService {
  constructor(private api: ApiService) {}

  getAll(filters?: { nombre?: string; category?: number; capacidad?: number }): Observable<Resource[]> {
    return this.api.get<Resource[]>('/resources', filters as Record<string, string>);
  }

  getOne(id: number): Observable<Resource> {
    return this.api.get<Resource>(`/resources/${id}`);
  }

  create(payload: ResourcePayload): Observable<Resource> {
    return this.api.post<Resource>('/resources', payload);
  }

  update(id: number, payload: Partial<ResourcePayload>): Observable<Resource> {
    return this.api.put<Resource>(`/resources/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/resources/${id}`);
  }
}
