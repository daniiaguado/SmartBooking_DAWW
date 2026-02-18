import {
  Component, Input, OnInit, AfterViewInit, ChangeDetectionStrategy
} from '@angular/core';

@Component({
  selector: 'app-resource-filter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sb-card mb-4">
      <div class="card-body">
        <div class="row g-3 align-items-end">
          <div class="col-md-5">
            <label class="form-label small fw-semibold">
              <i class="bi bi-search me-1"></i>Buscar en tiempo real
            </label>
            <input
              type="text"
              class="form-control form-control-sm"
              placeholder="Filtra por nombre del recurso..."
              [(ngModel)]="searchText"
              (ngModelChange)="filterRealtime()"
            >
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-semibold">Capacidad mínima</label>
            <input
              type="number"
              class="form-control form-control-sm"
              min="1"
              placeholder="Ej: 10"
              [(ngModel)]="minCapacity"
              (ngModelChange)="filterRealtime()"
            >
          </div>
          <div class="col-md-4 d-flex gap-2">
            <button class="btn btn-outline-secondary btn-sm" (click)="clearLocalFilters()">
              <i class="bi bi-x-circle me-1"></i>Limpiar filtros
            </button>
            <span class="badge bg-secondary d-flex align-items-center" *ngIf="visibleCount >= 0">
              {{ visibleCount }} resultado{{ visibleCount !== 1 ? 's' : '' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ResourceFilterComponent implements OnInit, AfterViewInit {
  @Input('current-nombre')   currentNombre   = '';
  @Input('current-capacity') currentCapacity = '';
  @Input('filter-action')    filterAction    = '/resource';

  searchText  = '';
  minCapacity = '';
  visibleCount = -1;

  private cards: HTMLElement[] = [];

  ngOnInit(): void {
    this.searchText  = this.currentNombre;
    this.minCapacity = this.currentCapacity !== '0' ? this.currentCapacity : '';
  }

  ngAfterViewInit(): void {
    this.cards = Array.from(document.querySelectorAll<HTMLElement>('.resource-card'));
    if (this.searchText || this.minCapacity) {
      this.filterRealtime();
    } else {
      this.visibleCount = this.cards.length;
    }
  }

  filterRealtime(): void {
    const text = this.searchText.toLowerCase().trim();
    const cap  = parseInt(this.minCapacity, 10) || 0;

    let count = 0;
    this.cards.forEach(card => {
      const col = card.closest('.col-sm-6, .col-lg-4, .col-xl-3') as HTMLElement;
      if (!col) return;

      const name = card.querySelector('h6')?.textContent?.toLowerCase() ?? '';
      const cardCapEl = card.querySelector('.col-6:last-child strong');
      const cardCap = parseInt(cardCapEl?.textContent ?? '0', 10) || 0;

      const matchesText = !text || name.includes(text);
      const matchesCap  = cap === 0 || cardCap >= cap;

      if (matchesText && matchesCap) {
        col.style.display = '';
        col.classList.add('sb-fade-in');
        count++;
      } else {
        col.style.display = 'none';
      }
    });

    this.visibleCount = count;
  }

  clearLocalFilters(): void {
    this.searchText  = '';
    this.minCapacity = '';
    this.filterRealtime();
  }
}
