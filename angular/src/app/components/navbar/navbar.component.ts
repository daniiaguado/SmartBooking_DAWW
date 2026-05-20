import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { AuthService, AuthUser } from '../../services/auth.service';
import { UserService, Empresa } from '../../services/user.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit, OnDestroy {
  user: AuthUser | null = null;

  searchQuery = '';
  searchResults: Empresa[] = [];
  searchLoading = false;
  showDropdown = false;

  private search$ = new Subject<string>();
  private subs: Subscription[] = [];

  constructor(
    public auth: AuthService,
    private router: Router,
    private userSvc: UserService,
    private elRef: ElementRef,
    private themeService: ThemeService
  ) {}

  get isDark(): boolean {
    return this.themeService.isDark;
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  ngOnInit(): void {
    this.subs.push(
      this.auth.currentUser$.subscribe(u => (this.user = u))
    );

    this.subs.push(
      this.search$
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap(q => {
            if (q.length < 2) {
              this.searchResults = [];
              this.showDropdown = false;
              this.searchLoading = false;
              return [];
            }
            this.searchLoading = true;
            return this.userSvc.searchEmpresas(q);
          })
        )
        .subscribe({
          next: results => {
            this.searchResults = results;
            this.showDropdown = results.length > 0;
            this.searchLoading = false;
          },
          error: () => {
            this.searchResults = [];
            this.searchLoading = false;
          },
        })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  logout(): void {
    this.auth.logout();
  }

  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  onSearchInput(value: string): void {
    this.searchQuery = value;
    this.search$.next(value);
  }

  selectEmpresa(empresa: Empresa): void {
    this.closeSearch();
    this.router.navigate(['/app/bookings/new'], {
      queryParams: { empresa: empresa.id },
    });
  }

  closeSearch(): void {
    this.showDropdown = false;
    this.searchQuery = '';
    this.searchResults = [];
  }

  getInitial(nombre: string): string {
    return (nombre ?? '?').charAt(0).toUpperCase();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.showDropdown = false;
    }
  }
}
