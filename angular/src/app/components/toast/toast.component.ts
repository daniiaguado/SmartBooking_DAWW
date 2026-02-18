import {
  Component, Input, OnInit, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';

interface Toast {
  id:      number;
  type:    'success' | 'danger' | 'warning' | 'info';
  message: string;
  visible: boolean;
}

@Component({
  selector: 'app-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .toast-stack {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-width: 280px;
      max-width: 380px;
    }
    .sb-toast {
      border-radius: 0.75rem;
      padding: 0.75rem 1rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.9rem;
      font-weight: 500;
      animation: slideIn 0.3s ease;
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to   { transform: translateX(0);    opacity: 1; }
    }
    .close-btn {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      margin-left: auto;
      opacity: 0.7;
    }
    .close-btn:hover { opacity: 1; }
    .toast-success { background: #d1e7dd; color: #0a3622; }
    .toast-danger  { background: #f8d7da; color: #58151c; }
    .toast-warning { background: #fff3cd; color: #664d03; }
    .toast-info    { background: #cff4fc; color: #055160; }
  `],
  template: `
    <div class="toast-stack">
      <div *ngFor="let t of toasts"
           class="sb-toast toast-{{ t.type }}"
           [style.display]="t.visible ? 'flex' : 'none'">
        <span *ngIf="t.type === 'success'">✓</span>
        <span *ngIf="t.type === 'danger'">✗</span>
        <span *ngIf="t.type === 'warning'">⚠</span>
        <span *ngIf="t.type === 'info'">ℹ</span>
        {{ t.message }}
        <button class="close-btn" (click)="dismiss(t.id)">×</button>
      </div>
    </div>
  `,
})
export class ToastComponent implements OnInit {
  toasts: Toast[] = [];
  private nextId = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    window.addEventListener('sb:toast', (event: any) => {
      const { type = 'info', message = '', duration = 5000 } = event.detail ?? {};
      this.show(type, message, duration);
    });
  }

  show(type: Toast['type'], message: string, duration = 5000): void {
    const id = ++this.nextId;
    this.toasts.push({ id, type, message, visible: true });
    this.cdr.detectChanges();

    setTimeout(() => this.dismiss(id), duration);
  }

  dismiss(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.cdr.detectChanges();
  }
}
