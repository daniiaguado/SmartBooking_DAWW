import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of, timer } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

export type PasswordStrength = 'weak' | 'medium' | 'strong' | '';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  errorMessage = '';
  showPassword = false;
  showConfirm = false;
  currentYear = new Date().getFullYear();
  passwordStrength: PasswordStrength = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        userType:       ['persona'],
        email:          ['', [Validators.required, Validators.email], [this.emailAvailableValidator()]],
        password:       ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword:['', [Validators.required]],
        // Campos Persona
        nombre:         [''],
        apellidos:      [''],
        dni:            ['', [Validators.pattern(/^\d{8}[A-Za-z]$/)]],
        telefono:       [''],
        // Campos Empresa
        nombreEmpresa:  [''],
        cif:            [''],
        sector:         [''],
        telefonoEmpresa:[''],
        // Términos
        agreeTerms:     [false, [Validators.requiredTrue]],
      },
      { validators: this.passwordMatchValidator }
    );

    this.registerForm.get('userType')!.valueChanges.subscribe(() => {
      this.updateConditionalValidators();
    });

    this.registerForm.get('password')!.valueChanges.subscribe(val => {
      this.passwordStrength = this.computeStrength(val);
    });

    this.updateConditionalValidators();
  }

  // ── Validators ──────────────────────────────────────────────────────────────

  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const pw  = group.get('password')?.value;
    const cpw = group.get('confirmPassword')?.value;
    return pw && cpw && pw !== cpw ? { passwordMismatch: true } : null;
  }

  private emailAvailableValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value || control.errors?.['email']) return of(null);
      return timer(400).pipe(
        switchMap(() =>
          this.http.get<{ available: boolean }>(
            `/api/check-email?email=${encodeURIComponent(control.value)}`,
            { withCredentials: true }
          )
        ),
        map(res => (res.available ? null : { emailTaken: true })),
        catchError(() => of(null))
      );
    };
  }

  private updateConditionalValidators(): void {
    const type = this.userType;
    const personaFields  = ['nombre', 'apellidos', 'dni'];
    const empresaFields  = ['nombreEmpresa', 'cif'];

    personaFields.forEach(f => {
      const ctrl = this.registerForm.get(f)!;
      if (type === 'persona') {
        if (f === 'dni') {
          ctrl.setValidators([Validators.required, Validators.pattern(/^\d{8}[A-Za-z]$/)]);
        } else {
          ctrl.setValidators([Validators.required]);
        }
      } else {
        ctrl.clearValidators();
      }
      ctrl.updateValueAndValidity({ emitEvent: false });
    });

    empresaFields.forEach(f => {
      const ctrl = this.registerForm.get(f)!;
      if (type === 'empresa') {
        ctrl.setValidators([Validators.required]);
      } else {
        ctrl.clearValidators();
      }
      ctrl.updateValueAndValidity({ emitEvent: false });
    });
  }

  // ── Password strength ───────────────────────────────────────────────────────

  computeStrength(val: string): PasswordStrength {
    if (!val || val.length < 8) return 'weak';
    const hasLetters = /[A-Za-z]/.test(val);
    const hasNumbers = /[0-9]/.test(val);
    const hasSymbols = /[^A-Za-z0-9]/.test(val);
    if (hasLetters && hasNumbers && hasSymbols) return 'strong';
    if (hasLetters && hasNumbers) return 'medium';
    return 'weak';
  }

  get strengthLabel(): string {
    const map: Record<PasswordStrength, string> = {
      '': '', weak: 'Débil', medium: 'Media', strong: 'Fuerte',
    };
    return map[this.passwordStrength];
  }

  get strengthClass(): string {
    const map: Record<PasswordStrength, string> = {
      '': '', weak: 'bg-danger', medium: 'bg-warning', strong: 'bg-success',
    };
    return map[this.passwordStrength];
  }

  get strengthWidth(): string {
    const map: Record<PasswordStrength, string> = {
      '': '0%', weak: '33%', medium: '66%', strong: '100%',
    };
    return map[this.passwordStrength];
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  get userType(): string {
    return this.registerForm.get('userType')!.value;
  }

  selectType(type: string): void {
    this.registerForm.get('userType')!.setValue(type);
  }

  togglePassword(): void  { this.showPassword = !this.showPassword; }
  toggleConfirm(): void   { this.showConfirm  = !this.showConfirm;  }

  ctrl(name: string) { return this.registerForm.get(name)!; }

  // ── Submit ──────────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const v = this.registerForm.value;
    const body: Record<string, any> = {
      email:    v.email,
      password: v.password,
      userType: v.userType,
    };

    if (v.userType === 'persona') {
      body['nombre']    = v.nombre;
      body['apellidos'] = v.apellidos;
      body['dni']       = v.dni;
      body['telefono']  = v.telefono;
    } else {
      body['nombreEmpresa']   = v.nombreEmpresa;
      body['cif']             = v.cif;
      body['sector']          = v.sector;
      body['telefonoEmpresa'] = v.telefonoEmpresa;
    }

    this.http.post<{ success: boolean; message?: string; errors?: Record<string, string> }>(
      '/api/register', body, { withCredentials: true }
    ).subscribe({
      next: res => {
        if (res.success) {
          // Login automático tras registro
          this.authService.login(v.email, v.password).subscribe({
            next: (loginRes: any) => {
              this.loading = false;
              if (loginRes?.success) {
                this.authService.setCurrentUser(loginRes.user);
                this.router.navigate(['/app/dashboard']);
              }
            },
            error: () => {
              this.loading = false;
              this.router.navigate(['/app/login']);
            },
          });
        } else {
          this.loading = false;
          this.errorMessage = 'Error al crear la cuenta. Revisa los campos.';
        }
      },
      error: err => {
        this.loading = false;
        const apiErrors: Record<string, string> = err?.error?.errors ?? {};
        if (Object.keys(apiErrors).length > 0) {
          Object.entries(apiErrors).forEach(([field, msg]) => {
            this.registerForm.get(field)?.setErrors({ apiError: msg });
          });
          this.errorMessage = 'Corrige los errores del formulario.';
        } else {
          this.errorMessage = err?.error?.message ?? 'Error al crear la cuenta.';
        }
      },
    });
  }
}
