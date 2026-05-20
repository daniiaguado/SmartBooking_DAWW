import { Component, OnInit } from '@angular/core';
import { BookingService, Booking, BookingFilters } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-bookings-list',
  templateUrl: './bookings-list.component.html',
})
export class BookingsListComponent implements OnInit {
  bookings: Booking[] = [];
  loading = true;
  error = '';
  successMsg = '';

  filters: BookingFilters = {};
  estados = ['pendiente', 'confirmada', 'cancelada'];

  constructor(private bookingSvc: BookingService, public auth: AuthService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.bookingSvc.getAll(this.filters).subscribe({
      next: data => {
        this.bookings = data;
        this.loading = false;
      },
      error: e => {
        this.error = e.message;
        this.loading = false;
      },
    });
  }

  confirmar(id: number): void {
    this.bookingSvc.confirmar(id).subscribe({
      next: updated => {
        this.updateLocal(updated);
        this.successMsg = 'Reserva confirmada';
        setTimeout(() => (this.successMsg = ''), 3000);
      },
      error: e => (this.error = e.message),
    });
  }

  cancelar(id: number): void {
    if (!confirm('¿Seguro que quieres cancelar esta reserva?')) return;
    this.bookingSvc.cancelar(id).subscribe({
      next: updated => {
        this.updateLocal(updated);
        this.successMsg = 'Reserva cancelada';
        setTimeout(() => (this.successMsg = ''), 3000);
      },
      error: e => (this.error = e.message),
    });
  }

  eliminar(id: number): void {
    if (!confirm('¿Eliminar esta reserva definitivamente?')) return;
    this.bookingSvc.delete(id).subscribe({
      next: () => {
        this.bookings = this.bookings.filter(b => b.id !== id);
        this.successMsg = 'Reserva eliminada';
        setTimeout(() => (this.successMsg = ''), 3000);
      },
      error: e => (this.error = e.message),
    });
  }

  applyFilters(): void {
    this.load();
  }

  resetFilters(): void {
    this.filters = {};
    this.load();
  }

  estadoBadge(estado: string): string {
    const map: Record<string, string> = {
      pendiente: 'badge-pendiente',
      confirmada: 'badge-confirmada',
      cancelada: 'badge-cancelada',
    };
    return map[estado] ?? 'bg-secondary';
  }

  private updateLocal(updated: Booking): void {
    const idx = this.bookings.findIndex(b => b.id === updated.id);
    if (idx !== -1) this.bookings[idx] = updated;
  }
}
