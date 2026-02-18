import { NgModule, Injector, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { createCustomElement } from '@angular/elements';

import { BookingFilterComponent } from './components/booking-filter/booking-filter.component';
import { ResourceFilterComponent } from './components/resource-filter/resource-filter.component';
import { FormValidatorComponent } from './components/form-validator/form-validator.component';
import { ToastComponent } from './components/toast/toast.component';

@NgModule({
  declarations: [
    BookingFilterComponent,
    ResourceFilterComponent,
    FormValidatorComponent,
    ToastComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {
  constructor(private injector: Injector) {}

  ngDoBootstrap(): void {
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
