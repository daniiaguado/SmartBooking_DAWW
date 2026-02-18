import {
  Component, Input, OnInit, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';

interface ActiveFilter {
  key:   string;
  label: string;
  value: string;
}

@Component({
  selector: 'app-booking-filter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sb-filter-panel mb-4">
      <div class="d-flex flex-wrap gap-3 align-items-end">

        <div>
          <label>Estado</label>
          <select [(ngModel)]="estado" class="form-select form-select-sm" style="min-width:140px">
            <option value="">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="confirmada">Confirmada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>

        <div>
          <label>Desde</label>
          <input type="date" [(ngModel)]="desde" class="form-control form-control-sm">
        </div>

        <div>
          <label>Hasta</label>
          <input type="date" [(ngModel)]="hasta" class="form-control form-control-sm">
        </div>

        <div class="d-flex gap-2">
          <button class="btn btn-primary btn-sm" (click)="applyFilters()">
            <i class="bi bi-search me-1"></i>Filtrar
          </button>
          <button class="btn btn-outline-secondary btn-sm" (click)="clearFilters()">
            <i class="bi bi-x-circle me-1"></i>Limpiar
          </button>
        </div>
      </div>

      <div class="d-flex flex-wrap gap-2 mt-2" *ngIf="activeFilters.length > 0">
        <span *ngFor="let f of activeFilters"
              class="badge rounded-pill"
              style="background:#e7f1ff;color:#0d6efd;border:1px solid #b6d4fe;cursor:pointer;font-size:.78rem"
              (click)="removeFilter(f.key)">
          {{ f.label }}: <strong>{{ f.value }}</strong>
          <span style="font-weight:700;margin-left:4px">×</span>
        </span>
      </div>
    </div>
  `,
})
export class BookingFilterComponent implements OnInit {
  @Input('current-estado')  currentEstado = '';
  @Input('current-desde')   currentDesde  = '';
  @Input('current-hasta')   currentHasta  = '';
  @Input('filter-action')   filterAction  = '/booking';

  estado = '';
  desde  = '';
  hasta  = '';

  activeFilters: ActiveFilter[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.estado = this.currentEstado;
    this.desde  = this.currentDesde;
    this.hasta  = this.currentHasta;
    this.rebuildActiveFilters();
  }

  applyFilters(): void {
    const params = new URLSearchParams();
    if (this.estado) params.set('estado', this.estado);
    if (this.desde)  params.set('desde', this.desde);
    if (this.hasta)  params.set('hasta', this.hasta);

    const query = params.toString();
    window.location.href = this.filterAction + (query ? '?' + query : '');
  }

  clearFilters(): void {
    window.location.href = this.filterAction;
  }

  removeFilter(key: string): void {
    if (key === 'estado') this.estado = '';
    if (key === 'desde')  this.desde  = '';
    if (key === 'hasta')  this.hasta  = '';
    this.applyFilters();
  }

  private rebuildActiveFilters(): void {
    this.activeFilters = [];
    if (this.estado) this.activeFilters.push({ key: 'estado', label: 'Estado', value: this.estado });
    if (this.desde)  this.activeFilters.push({ key: 'desde',  label: 'Desde',  value: this.desde });
    if (this.hasta)  this.activeFilters.push({ key: 'hasta',  label: 'Hasta',  value: this.hasta });
  }
}
