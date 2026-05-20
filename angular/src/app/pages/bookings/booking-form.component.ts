import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService, Booking, BookingPayload } from '../../services/booking.service';
import { ResourceService, Resource } from '../../services/resource.service';
import { AuthService } from '../../services/auth.service';
import { UserService, Empresa } from '../../services/user.service';

@Component({
  selector: 'app-booking-form',
  templateUrl: './booking-form.component.html',
})
export class BookingFormComponent implements OnInit {
  isEdit = false;
  bookingId: number | null = null;
  loading = true;
  saving = false;
  error = '';

  resources: Resource[] = [];
  estados = ['pendiente', 'confirmada', 'cancelada'];

  empresaSeleccionada: Empresa | null = null;

  form: BookingPayload & { id?: number } = {
    resourceId: 0,
    fechaInicio: '',
    fechaFin: '',
    asistentes: 1,
    motivo: '',
    clienteNombre: '',
    estado: 'pendiente',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingSvc: BookingService,
    private resourceSvc: ResourceService,
    public auth: AuthService,
    private userSvc: UserService
  ) {}

  ngOnInit(): void {
    this.bookingId = this.route.snapshot.params['id'] ? +this.route.snapshot.params['id'] : null;
    this.isEdit = !!this.bookingId;

    const empresaId = this.route.snapshot.queryParams['empresa'];
    if (empresaId && !this.isEdit) {
      this.userSvc.getEmpresa(+empresaId).subscribe({
        next: emp => {
          this.empresaSeleccionada = emp;
          if (!this.form.clienteNombre) {
            this.form.clienteNombre = emp.nombreEmpresa;
          }
        },
        error: () => { /* si falla, simplemente no mostramos la card */ },
      });
    }

    this.resourceSvc.getAll().subscribe({
      next: r => {
        this.resources = r;
        if (this.isEdit) {
          this.loadBooking();
        } else {
          this.loading = false;
        }
      },
      error: e => {
        this.error = e.message;
        this.loading = false;
      },
    });
  }

  private loadBooking(): void {
    this.bookingSvc.getOne(this.bookingId!).subscribe({
      next: b => {
        this.form = {
          resourceId: b.resource?.id ?? 0,
          fechaInicio: this.toDatetimeLocal(b.fechaInicio),
          fechaFin: this.toDatetimeLocal(b.fechaFin),
          asistentes: b.asistentes,
          motivo: b.motivo ?? '',
          clienteNombre: b.clienteNombre ?? '',
          estado: b.estado,
        };
        this.loading = false;
      },
      error: e => {
        this.error = e.message;
        this.loading = false;
      },
    });
  }

  submit(): void {
    if (!this.form.resourceId || !this.form.fechaInicio || !this.form.fechaFin) {
      this.error = 'Recurso, fecha de inicio y fecha de fin son obligatorios';
      return;
    }

    this.saving = true;
    this.error = '';

    const payload: BookingPayload = {
      ...this.form,
      fechaInicio: this.fromDatetimeLocal(this.form.fechaInicio),
      fechaFin: this.fromDatetimeLocal(this.form.fechaFin),
    };

    const obs = this.isEdit
      ? this.bookingSvc.update(this.bookingId!, payload)
      : this.bookingSvc.create(payload);

    obs.subscribe({
      next: () => this.router.navigate(['/app/bookings']),
      error: e => {
        this.error = e.message;
        this.saving = false;
      },
    });
  }

  private toDatetimeLocal(dateStr: string): string {
    if (!dateStr) return '';
    return dateStr.replace(' ', 'T').substring(0, 16);
  }

  private fromDatetimeLocal(val: string): string {
    return val.replace('T', ' ') + ':00';
  }
}
