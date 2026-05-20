import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService, Booking } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-booking-detail',
  templateUrl: './booking-detail.component.html',
})
export class BookingDetailComponent implements OnInit {
  booking: Booking | null = null;
  loading = true;
  error = '';
  successMsg = '';
  actionLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingSvc: BookingService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error = 'ID de reserva no válido';
      this.loading = false;
      return;
    }
    this.bookingSvc.getOne(id).subscribe({
      next: b => {
        this.booking = b;
        this.loading = false;
      },
      error: e => {
        this.error = e.message ?? 'No se encontró la reserva';
        this.loading = false;
      },
    });
  }

  estadoBadge(estado: string): string {
    const map: Record<string, string> = {
      pendiente:  'badge-pendiente',
      confirmada: 'badge-confirmada',
      cancelada:  'badge-cancelada',
    };
    return map[estado] ?? 'bg-secondary';
  }

  duracionTexto(): string {
    if (!this.booking) return '–';
    const h = this.booking.duracionHoras;
    if (h < 1) return `${Math.round(h * 60)} min`;
    const horas = Math.floor(h);
    const mins  = Math.round((h - horas) * 60);
    let txt = `${horas} hora${horas !== 1 ? 's' : ''}`;
    if (mins > 0) txt += ` ${mins} min`;
    return txt;
  }

  confirmar(): void {
    if (!this.booking) return;
    this.actionLoading = true;
    this.bookingSvc.confirmar(this.booking.id).subscribe({
      next: updated => {
        this.booking = updated;
        this.successMsg = 'Reserva confirmada correctamente';
        this.actionLoading = false;
        setTimeout(() => (this.successMsg = ''), 4000);
      },
      error: e => {
        this.error = e.message;
        this.actionLoading = false;
      },
    });
  }

  cancelar(): void {
    if (!this.booking) return;
    if (!confirm('¿Seguro que quieres cancelar esta reserva?')) return;
    this.actionLoading = true;
    this.bookingSvc.cancelar(this.booking.id).subscribe({
      next: updated => {
        this.booking = updated;
        this.successMsg = 'Reserva cancelada';
        this.actionLoading = false;
        setTimeout(() => (this.successMsg = ''), 4000);
      },
      error: e => {
        this.error = e.message;
        this.actionLoading = false;
      },
    });
  }

  volverALista(): void {
    this.router.navigate(['/app/bookings']);
  }

  irAEditar(): void {
    if (!this.booking) return;
    this.router.navigate(['/app/bookings', this.booking.id, 'edit']);
  }
}
