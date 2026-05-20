import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  loading = true;
  isLoginPage = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    // Detectar si estamos en la página de login para ajustar el layout
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      const url: string = e.urlAfterRedirects ?? e.url ?? '';
      this.isLoginPage = url === '/app/login'    || url.startsWith('/app/login?')
                      || url === '/app/register' || url.startsWith('/app/register?');
      if (this.isLoginPage) {
        this.loading = false;
      }
    });

    // Intentar cargar el usuario actual; AuthGuard redirige a /app/login si falla
    this.auth.loadCurrentUser().subscribe({
      next: () => (this.loading = false),
      error: () => (this.loading = false),
    });
  }
}
