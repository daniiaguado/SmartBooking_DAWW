import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';
  showPassword = false;
  currentYear = new Date().getFullYear();

  private userSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email:      ['', [Validators.required, Validators.email]],
      password:   ['', [Validators.required]],
      rememberMe: [false],
    });

    // Si el usuario ya está autenticado (o se autentica durante la carga), ir al dashboard
    this.userSub = this.authService.currentUser$.pipe(
      filter(user => !!user),
      take(1)
    ).subscribe(() => {
      this.router.navigate(['/app/dashboard']);
    });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  get emailCtrl()    { return this.loginForm.get('email')!; }
  get passwordCtrl() { return this.loginForm.get('password')!; }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (response: any) => {
        this.loading = false;
        if (response?.success) {
          this.authService.setCurrentUser(response.user);
          this.router.navigate(['/app/dashboard']);
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err?.error?.message ?? 'Email o contraseña incorrectos';
      },
    });
  }
}
