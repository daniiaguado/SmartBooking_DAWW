import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  isDark = false;

  constructor() {
    const saved = localStorage.getItem('sb-theme');
    this.isDark = saved === 'dark';
    this.applyTheme();
  }

  toggle(): void {
    this.isDark = !this.isDark;
    localStorage.setItem('sb-theme', this.isDark ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme(): void {
    if (this.isDark) {
      document.documentElement.setAttribute('data-bs-theme', 'dark');
      document.body.classList.add('sb-dark');
    } else {
      document.documentElement.setAttribute('data-bs-theme', 'light');
      document.body.classList.remove('sb-dark');
    }
  }
}
