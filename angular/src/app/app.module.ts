import { NgModule, Injector, ApplicationRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { createCustomElement } from '@angular/elements';

// ── Componentes originales (Web Components) ─────────────────────────────────
import { BookingFilterComponent } from './components/booking-filter/booking-filter.component';
import { ResourceFilterComponent } from './components/resource-filter/resource-filter.component';
import { FormValidatorComponent } from './components/form-validator/form-validator.component';
import { ToastComponent } from './components/toast/toast.component';

// ── Componentes SPA ──────────────────────────────────────────────────────────
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { BookingsListComponent } from './pages/bookings/bookings-list.component';
import { BookingFormComponent } from './pages/bookings/booking-form.component';
import { ResourcesListComponent } from './pages/resources/resources-list.component';
import { CategoriesListComponent } from './pages/categories/categories-list.component';
import { EmpresasComponent } from './pages/empresas/empresas.component';
import { BookingDetailComponent } from './pages/bookings/booking-detail.component';
import { RegisterComponent } from './pages/register/register.component';
import { MiEmpresaComponent } from './pages/mi-empresa/mi-empresa.component';
import { PerfilComponent } from './pages/perfil/perfil.component';

// ── Guards ───────────────────────────────────────────────────────────────────
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: 'app/login',              component: LoginComponent },
  { path: 'app/register',           component: RegisterComponent },
  { path: 'app/dashboard',          component: DashboardComponent,      canActivate: [AuthGuard] },
  { path: 'app/bookings',           component: BookingsListComponent,   canActivate: [AuthGuard] },
  { path: 'app/bookings/new',       component: BookingFormComponent,    canActivate: [AuthGuard] },
  { path: 'app/bookings/:id',       component: BookingDetailComponent,  canActivate: [AuthGuard] },
  { path: 'app/bookings/:id/edit',  component: BookingFormComponent,    canActivate: [AuthGuard] },
  { path: 'app/resources',          component: ResourcesListComponent,  canActivate: [AuthGuard] },
  { path: 'app/categories',         component: CategoriesListComponent, canActivate: [AuthGuard] },
  { path: 'app/empresas',           component: EmpresasComponent,       canActivate: [AuthGuard] },
  { path: 'app/mi-empresa',         component: MiEmpresaComponent,      canActivate: [AuthGuard] },
  { path: 'app/perfil',             component: PerfilComponent,          canActivate: [AuthGuard] },
  { path: 'app',                    redirectTo: 'app/dashboard', pathMatch: 'full' },
  { path: '',                       redirectTo: 'app/dashboard', pathMatch: 'full' },
];

@NgModule({
  declarations: [
    // Web Components
    BookingFilterComponent,
    ResourceFilterComponent,
    FormValidatorComponent,
    ToastComponent,
    // SPA Components
    AppComponent,
    NavbarComponent,
    LoginComponent,
    RegisterComponent,
    MiEmpresaComponent,
    PerfilComponent,
    DashboardComponent,
    BookingsListComponent,
    BookingFormComponent,
    BookingDetailComponent,
    ResourcesListComponent,
    CategoriesListComponent,
    EmpresasComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes, {
      useHash: false,
    }),
  ],
  // bootstrap vacío: ngDoBootstrap controla el arranque manual (SPA + Web Components)
  bootstrap: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {
  constructor(private injector: Injector, private appRef: ApplicationRef) {}

  ngDoBootstrap(): void {
    // Arrancar el componente raíz de la SPA manualmente
    this.appRef.bootstrap(AppComponent);

    // Registrar los Web Components para las vistas Twig
    this.defineCustomElement('app-booking-filter',  BookingFilterComponent);
    this.defineCustomElement('app-resource-filter', ResourceFilterComponent);
    this.defineCustomElement('app-form-validator',  FormValidatorComponent);
    this.defineCustomElement('app-toast',           ToastComponent);
  }

  private defineCustomElement(selector: string, component: any): void {
    if (!customElements.get(selector)) {
      const element = createCustomElement(component, { injector: this.injector });
      customElements.define(selector, element);
    }
  }
}
