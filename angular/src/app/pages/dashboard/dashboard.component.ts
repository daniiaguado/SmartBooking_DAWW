import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Booking } from '../../services/booking.service';

interface DashboardData {
  totalReservas: number;
  reservasConfirmadas: number;
  reservasPendientes: number;
  reservasCanceladas: number;
  totalRecursos: number;
  proximasReservas: Booking[];
  // Admin
  totalUsuarios?: number;
  // Empresa
  nombreEmpresa?: string;
  cif?: string;
  sector?: string;
  telefonoEmpresa?: string;
  ultimasReservasRecibidas?: Booking[];
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  data: DashboardData | null = null;
  loading = true;
  error = '';

  constructor(private api: ApiService, public auth: AuthService) {}

  ngOnInit(): void {
    this.api.get<DashboardData>('/dashboard').subscribe({
      next: d => {
        this.data = d;
        this.loading = false;
      },
      error: e => {
        this.error = e.message;
        this.loading = false;
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

  get isPersona(): boolean {
    return !this.auth.currentUser?.isAdmin && this.auth.currentUser?.userType === 'persona';
  }

  get isEmpresa(): boolean {
    return !this.auth.currentUser?.isAdmin && this.auth.currentUser?.userType === 'empresa';
  }

  get isAdmin(): boolean {
    return !!this.auth.currentUser?.isAdmin;
  }
}
