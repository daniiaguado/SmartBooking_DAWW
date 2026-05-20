import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Booking {
  id: number;
  estado: 'pendiente' | 'confirmada' | 'cancelada';
  fechaInicio: string;
  fechaFin: string;
  asistentes: number;
  motivo?: string;
  clienteNombre?: string;
  precioTotal?: string;
  duracionHoras: number;
  createdAt: string;
  resource?: {
    id: number;
    nombre: string;
    ubicacion?: string;
    capacidad: number;
    precioHora: string;
    category?: { id: number; nombre: string; color: string };
  };
  user?: { id: number; displayName: string; email: string };
}

export interface BookingFilters {
  estado?: string;
  resource?: number;
  desde?: string;
  hasta?: string;
}

export interface BookingPayload {
  resourceId: number;
  fechaInicio: string;
  fechaFin: string;
  asistentes?: number;
  motivo?: string;
  clienteNombre?: string;
  estado?: string;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  constructor(private api: ApiService) {}

  getAll(filters?: BookingFilters): Observable<Booking[]> {
    return this.api.get<Booking[]>('/bookings', filters as Record<string, string>);
  }

  getOne(id: number): Observable<Booking> {
    return this.api.get<Booking>(`/bookings/${id}`);
  }

  create(payload: BookingPayload): Observable<Booking> {
    return this.api.post<Booking>('/bookings', payload);
  }

  update(id: number, payload: Partial<BookingPayload>): Observable<Booking> {
    return this.api.put<Booking>(`/bookings/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/bookings/${id}`);
  }

  confirmar(id: number): Observable<Booking> {
    return this.api.post<Booking>(`/bookings/${id}/confirmar`, {});
  }

  cancelar(id: number): Observable<Booking> {
    return this.api.post<Booking>(`/bookings/${id}/cancelar`, {});
  }
}
