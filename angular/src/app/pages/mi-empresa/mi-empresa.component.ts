import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService, AuthUser } from '../../services/auth.service';
import { Booking } from '../../services/booking.service';

@Component({
  selector: 'app-mi-empresa',
  templateUrl: './mi-empresa.component.html',
})
export class MiEmpresaComponent implements OnInit {
  user: AuthUser | null = null;
  form!: FormGroup;
  bookings: Booking[] = [];

  loadingBookings = true;
  saving = false;
  saveSuccess = false;
  saveError = '';
  loadingError = '';

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.user = this.auth.currentUser;

    this.form = this.fb.group({
      nombreEmpresa:   [this.user?.nombreEmpresa ?? '', Validators.required],
      cif:             [this.user?.cif ?? ''],
      sector:          [this.user?.sector ?? ''],
      telefonoEmpresa: [this.user?.telefonoEmpresa ?? ''],
    });

    this.api.get<Booking[]>('/bookings').subscribe({
      next: data => {
        this.bookings = data;
        this.loadingBookings = false;
      },
      error: () => {
        this.loadingError = 'No se pudieron cargar las reservas.';
        this.loadingBookings = false;
      },
    });
  }

  save(): void {
    if (this.form.invalid) return;

    this.saving = true;
    this.saveSuccess = false;
    this.saveError = '';

    this.api.put<AuthUser>('/profile', this.form.value).subscribe({
      next: updatedUser => {
        this.auth.setCurrentUser(updatedUser);
        this.user = updatedUser;
        this.saving = false;
        this.saveSuccess = true;
        setTimeout(() => (this.saveSuccess = false), 3000);
      },
      error: e => {
        this.saving = false;
        this.saveError = e?.error?.error ?? 'Error al guardar los datos.';
      },
    });
  }

  estadoBadge(estado: string): string {
    const map: Record<string, string> = {
      pendiente: 'badge-pendiente',
      confirmada: 'badge-confirmada',
      cancelada: 'badge-cancelada',
    };
    return map[estado] ?? 'bg-secondary';
  }
}
