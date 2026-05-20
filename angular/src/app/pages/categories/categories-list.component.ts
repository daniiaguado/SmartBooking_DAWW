import { Component, OnInit } from '@angular/core';
import { CategoryService, Category, CategoryPayload } from '../../services/category.service';

@Component({
  selector: 'app-categories-list',
  templateUrl: './categories-list.component.html',
})
export class CategoriesListComponent implements OnInit {
  categories: Category[] = [];
  loading = true;
  error = '';
  successMsg = '';

  showForm = false;
  editingCategory: Category | null = null;
  form: CategoryPayload = { nombre: '', descripcion: '', color: '#6366f1' };

  constructor(private categorySvc: CategoryService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.categorySvc.getAll().subscribe({
      next: data => {
        this.categories = data;
        this.loading = false;
      },
      error: e => {
        this.error = e.message;
        this.loading = false;
      },
    });
  }

  openNew(): void {
    this.editingCategory = null;
    this.form = { nombre: '', descripcion: '', color: '#6366f1' };
    this.showForm = true;
  }

  openEdit(c: Category): void {
    this.editingCategory = c;
    this.form = { nombre: c.nombre, descripcion: c.descripcion ?? '', color: c.color };
    this.showForm = true;
  }

  save(): void {
    if (!this.form.nombre) {
      this.error = 'El nombre es obligatorio';
      return;
    }
    const obs = this.editingCategory
      ? this.categorySvc.update(this.editingCategory.id, this.form)
      : this.categorySvc.create(this.form);

    obs.subscribe({
      next: () => {
        this.showForm = false;
        this.successMsg = this.editingCategory ? 'Categoría actualizada' : 'Categoría creada';
        setTimeout(() => (this.successMsg = ''), 3000);
        this.load();
      },
      error: e => (this.error = e.message),
    });
  }

  delete(c: Category): void {
    if (!confirm(`¿Eliminar la categoría "${c.nombre}"?`)) return;
    this.categorySvc.delete(c.id).subscribe({
      next: () => {
        this.categories = this.categories.filter(x => x.id !== c.id);
        this.successMsg = 'Categoría eliminada';
        setTimeout(() => (this.successMsg = ''), 3000);
      },
      error: e => (this.error = e.message),
    });
  }
}
