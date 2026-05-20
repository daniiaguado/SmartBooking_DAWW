import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { UserService, Empresa } from '../../services/user.service';

@Component({
  selector: 'app-empresas',
  templateUrl: './empresas.component.html',
})
export class EmpresasComponent implements OnInit, OnDestroy {
  empresas: Empresa[] = [];
  loading = true;
  error = '';
  searchQuery = '';

  private search$ = new Subject<string>();
  private sub?: Subscription;

  constructor(private userSvc: UserService, private router: Router) {}

  ngOnInit(): void {
    this.sub = this.search$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(q => {
          this.loading = true;
          this.error = '';
          return this.userSvc.searchEmpresas(q);
        })
      )
      .subscribe({
        next: data => {
          this.empresas = data;
          this.loading = false;
        },
        error: e => {
          this.error = e.message;
          this.loading = false;
        },
      });

    this.search$.next('');
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onSearch(value: string): void {
    this.searchQuery = value;
    this.search$.next(value);
  }

  hacerReserva(empresa: Empresa): void {
    this.router.navigate(['/app/bookings/new'], {
      queryParams: { empresa: empresa.id },
    });
  }

  getInitial(empresa: Empresa): string {
    return (empresa.nombreEmpresa ?? '?').charAt(0).toUpperCase();
  }
}
