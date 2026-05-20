import { Component, OnInit } from '@angular/core';
import { ResourceService, Resource } from '../../services/resource.service';
import { CategoryService, Category } from '../../services/category.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-resources-list',
  templateUrl: './resources-list.component.html',
})
export class ResourcesListComponent implements OnInit {
  resources: Resource[] = [];
  categories: Category[] = [];
  loading = true;
  error = '';
  successMsg = '';

  showForm = false;
  editingResource: Resource | null = null;
  form: Partial<Resource & { categoryId?: number }> = {};

  constructor(
    private resourceSvc: ResourceService,
    private categorySvc: CategoryService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.load();
    this.categorySvc.getAll().subscribe({ next: c => (this.categories = c) });
  }

  load(): void {
    this.loading = true;
    this.resourceSvc.getAll().subscribe({
      next: data => {
        this.resources = data;
        this.loading = false;
      },
      error: e => {
        this.error = e.message;
        this.loading = false;
      },
    });
  }

  openNew(): void {
    this.editingResource = null;
    this.form = { capacidad: 1, precioHora: '0.00', isActive: true };
    this.showForm = true;
  }

  openEdit(r: Resource): void {
    this.editingResource = r;
    this.form = {
      nombre: r.nombre,
      descripcion: r.descripcion ?? '',
      capacidad: r.capacidad,
      ubicacion: r.ubicacion ?? '',
      precioHora: r.precioHora,
      isActive: r.isActive,
      categoryId: r.category?.id,
    };
    this.showForm = true;
  }

  save(): void {
    if (!this.form.nombre) {
      this.error = 'El nombre es obligatorio';
      return;
    }
    const obs = this.editingResource
      ? this.resourceSvc.update(this.editingResource.id, this.form)
      : this.resourceSvc.create(this.form as any);

    obs.subscribe({
      next: () => {
        this.showForm = false;
        this.successMsg = this.editingResource ? 'Recurso actualizado' : 'Recurso creado';
        setTimeout(() => (this.successMsg = ''), 3000);
        this.load();
      },
      error: e => (this.error = e.message),
    });
  }

  delete(r: Resource): void {
    if (!confirm(`¿Eliminar el recurso "${r.nombre}"?`)) return;
    this.resourceSvc.delete(r.id).subscribe({
      next: () => {
        this.resources = this.resources.filter(x => x.id !== r.id);
        this.successMsg = 'Recurso eliminado';
        setTimeout(() => (this.successMsg = ''), 3000);
      },
      error: e => (this.error = e.message),
    });
  }
}
