import {
  Component, Input, OnInit, AfterViewInit, ChangeDetectionStrategy
} from '@angular/core';

@Component({
  selector: 'app-form-validator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<!-- Form validator activo -->`,
})
export class FormValidatorComponent implements OnInit, AfterViewInit {
  @Input('form-id') formId = '';

  private form: HTMLFormElement | null = null;

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (!this.formId) return;

    this.form = document.getElementById(this.formId) as HTMLFormElement;
    if (!this.form) return;

    this.enhanceForm();
  }

  private enhanceForm(): void {
    if (!this.form) return;

    const inputs = this.form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      'input:not([type="hidden"]):not([type="checkbox"]), textarea, select'
    );

    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('is-invalid')) {
          this.validateField(input);
        }
      });

      if (input.tagName === 'TEXTAREA') {
        this.addCharCounter(input as HTMLTextAreaElement);
      }
    });

    this.setupDateValidation();

    this.form.addEventListener('submit', (e) => {
      let hasErrors = false;
      inputs.forEach(input => {
        if (!this.validateField(input)) {
          hasErrors = true;
        }
      });
      if (hasErrors) {
        e.preventDefault();
        const firstError = this.form?.querySelector('.is-invalid');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
  }

  private validateField(input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): boolean {
    const value = input.value.trim();
    let isValid = true;
    let message = '';

    if (input.required && !value) {
      isValid = false;
      message = 'Este campo es obligatorio.';
    }

    if (isValid && input.type === 'email' && value) {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(value)) {
        isValid = false;
        message = 'Introduce un email válido.';
      }
    }

    if (isValid && input.type === 'number' && value) {
      const minAttr = input.getAttribute('min');
      if (minAttr !== null && parseFloat(value) < parseFloat(minAttr)) {
        isValid = false;
        message = `El valor mínimo es ${minAttr}.`;
      }
    }

    if (isValid) {
      input.classList.remove('is-invalid');
      input.classList.add('is-valid');
      this.removeFeedback(input);
    } else {
      input.classList.remove('is-valid');
      input.classList.add('is-invalid');
      this.showFeedback(input, message);
    }

    return isValid;
  }

  private showFeedback(input: HTMLElement, message: string): void {
    this.removeFeedback(input);
    const div = document.createElement('div');
    div.className = 'invalid-feedback sb-validator-msg';
    div.style.display = 'block';
    div.innerHTML = `<i class="bi bi-exclamation-circle me-1"></i>${message}`;
    input.parentElement?.appendChild(div);
  }

  private removeFeedback(input: HTMLElement): void {
    input.parentElement?.querySelectorAll('.sb-validator-msg').forEach(el => el.remove());
  }

  private addCharCounter(textarea: HTMLTextAreaElement): void {
    const maxLen = parseInt(textarea.getAttribute('maxlength') ?? '0', 10);
    if (!maxLen) return;

    const counter = document.createElement('small');
    counter.className = 'text-muted float-end';
    counter.textContent = `0 / ${maxLen}`;
    textarea.parentElement?.appendChild(counter);

    textarea.addEventListener('input', () => {
      const len = textarea.value.length;
      counter.textContent = `${len} / ${maxLen}`;
      counter.className = `float-end small ${len > maxLen * 0.9 ? 'text-warning' : 'text-muted'}`;
    });
  }

  private setupDateValidation(): void {
    if (!this.form) return;

    const inputs = this.form.querySelectorAll<HTMLInputElement>('input[type="datetime-local"]');
    if (inputs.length < 2) return;

    const [startDate, endDate] = Array.from(inputs);

    const checkDates = () => {
      if (!startDate.value || !endDate.value) return;
      if (new Date(endDate.value) <= new Date(startDate.value)) {
        endDate.classList.add('is-invalid');
        this.showFeedback(endDate, 'La fecha de fin debe ser posterior a la fecha de inicio.');
      } else {
        endDate.classList.remove('is-invalid');
        endDate.classList.add('is-valid');
        this.removeFeedback(endDate);
      }
    };

    startDate.addEventListener('change', checkDates);
    endDate.addEventListener('change', checkDates);
  }
}
