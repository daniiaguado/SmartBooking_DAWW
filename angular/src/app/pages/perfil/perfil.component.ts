import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, of, timer } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { AuthService, AuthUser } from '../../services/auth.service';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const newPass = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;
  if (newPass && confirm && newPass !== confirm) {
    return { passwordMismatch: true };
  }
  return null;
}

function emailAvailableValidator(
  http: HttpClient,
  getOriginalEmail: () => string
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const value = (control.value ?? '').trim();
    if (!value || value === getOriginalEmail()) {
      return of(null);
    }
    return timer(500).pipe(
      switchMap(() =>
        http.get<{ available: boolean }>(
          `/api/check-email?email=${encodeURIComponent(value)}`,
          { withCredentials: true }
        )
      ),
      map(res => (res.available ? null : { emailTaken: true })),
      first()
    );
  };
}

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
})
export class PerfilComponent implements OnInit {
  user: AuthUser | null = null;
  form!: FormGroup;
  originalEmail = '';

  saving = false;
  saveSuccess = false;
  saveError = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private http: HttpClient,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.user = this.auth.currentUser;
    this.originalEmail = this.user?.email ?? '';

    this.form = this.fb.group(
      {
        nombre: [this.user?.nombre ?? '', Validators.required],
        apellidos: [this.user?.apellidos ?? '', Validators.required],
        dni: [this.user?.dni ?? ''],
        telefono: [this.user?.telefono ?? ''],
        email: [
          this.user?.email ?? '',
          {
            validators: [Validators.required, Validators.email],
            asyncValidators: [
              emailAvailableValidator(this.http, () => this.originalEmail),
            ],
            updateOn: 'blur',
          },
        ],
        currentPassword: [''],
        newPassword: [''],
        confirmPassword: [''],
      },
      { validators: [passwordMatchValidator] }
    );
  }

  get passwordMismatch(): boolean {
    return (
      !!this.form.hasError('passwordMismatch') &&
      !!this.form.get('confirmPassword')?.touched
    );
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;

    const currentCtrl = this.form.get('currentPassword')!;
    const newCtrl = this.form.get('newPassword')!;
    const confirmCtrl = this.form.get('confirmPassword')!;

    if (!this.showPassword) {
      this.form.patchValue({ currentPassword: '', newPassword: '', confirmPassword: '' });
      currentCtrl.clearValidators();
      newCtrl.clearValidators();
      confirmCtrl.clearValidators();
    } else {
      currentCtrl.setValidators([Validators.required]);
      newCtrl.setValidators([Validators.required, Validators.minLength(8)]);
      confirmCtrl.setValidators([Validators.required]);
    }
    currentCtrl.updateValueAndValidity();
    newCtrl.updateValueAndValidity();
    confirmCtrl.updateValueAndValidity();
  }

  save(): void {
    if (this.form.invalid || this.form.pending) return;

    this.saving = true;
    this.saveSuccess = false;
    this.saveError = '';

    const v = this.form.value;
    const body: Record<string, string> = {
      nombre: v.nombre,
      apellidos: v.apellidos,
      dni: v.dni ?? '',
      telefono: v.telefono ?? '',
      email: v.email,
    };

    if (this.showPassword && v.newPassword) {
      body['currentPassword'] = v.currentPassword;
      body['newPassword'] = v.newPassword;
    }

    this.api.put<AuthUser>('/profile', body).subscribe({
      next: updatedUser => {
        this.auth.setCurrentUser(updatedUser);
        this.user = updatedUser;
        this.originalEmail = updatedUser.email;
        this.saving = false;
        this.saveSuccess = true;
        if (this.showPassword) {
          this.togglePassword();
        }
        setTimeout(() => (this.saveSuccess = false), 3000);
      },
      error: e => {
        this.saving = false;
        this.saveError = e?.message ?? 'Error al guardar los datos.';
      },
    });
  }
}
