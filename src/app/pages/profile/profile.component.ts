import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { VehicleType } from '../../models/student-profile.model';

type ActiveTab = 'info' | 'vehicles' | 'history';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  private readonly auth    = inject(AuthService);
  private readonly profileSvc = inject(ProfileService);
  private readonly router  = inject(Router);
  private readonly fb      = inject(FormBuilder);

  // ── Data signals ────────────────────────────────────────────────────────
  readonly user    = this.auth.user;
  readonly profile = this.profileSvc.profile;

  // ── UI state ─────────────────────────────────────────────────────────────
  readonly activeTab   = signal<ActiveTab>('info');
  readonly editingInfo = signal(false);
  readonly showAddVehicle = signal(false);
  readonly savingInfo  = signal(false);

  // ── Info form ────────────────────────────────────────────────────────────
  readonly infoForm: FormGroup = this.fb.group({
    code:     ['', Validators.required],
    program:  ['', Validators.required],
    semester: [1,  [Validators.required, Validators.min(1), Validators.max(10)]],
    campus:   ['', Validators.required],
    phone:    ['', [Validators.required, Validators.pattern(/^\d{7,10}$/)]],
  });

  // ── Vehicle form ─────────────────────────────────────────────────────────
  readonly vehicleForm: FormGroup = this.fb.group({
    plate: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]{3,8}$/i)]],
    brand: ['', Validators.required],
    model: ['', Validators.required],
    color: ['', Validators.required],
    type:  ['car', Validators.required],
  });

  readonly vehicleTypes: { value: VehicleType; label: string; icon: string }[] = [
    { value: 'car',        label: 'Automóvil',  icon: '🚗' },
    { value: 'motorcycle', label: 'Motocicleta', icon: '🏍️' },
    { value: 'bicycle',    label: 'Bicicleta',   icon: '🚲' },
  ];

  // ── Computed helpers ─────────────────────────────────────────────────────
  readonly totalMinutes = computed(() =>
    (this.profile()?.parkingHistory ?? [])
      .reduce((acc, r) => acc + (r.durationMinutes ?? 0), 0)
  );

  readonly recentHistory = computed(() =>
    (this.profile()?.parkingHistory ?? []).slice(0, 10)
  );

  // ── Tab nav ──────────────────────────────────────────────────────────────
  setTab(tab: ActiveTab): void { this.activeTab.set(tab); }

  // ── Info editing ─────────────────────────────────────────────────────────
  startEdit(): void {
    const p = this.profile();
    if (!p) return;
    this.infoForm.patchValue({
      code:     p.code,
      program:  p.program,
      semester: p.semester,
      campus:   p.campus,
      phone:    p.phone,
    });
    this.editingInfo.set(true);
  }

  cancelEdit(): void { this.editingInfo.set(false); }

  async saveInfo(): Promise<void> {
    if (this.infoForm.invalid) { this.infoForm.markAllAsTouched(); return; }
    this.savingInfo.set(true);
    await new Promise((r) => setTimeout(r, 350)); // simulated async
    this.profileSvc.updateInfo(this.infoForm.value);
    this.savingInfo.set(false);
    this.editingInfo.set(false);
  }

  // ── Vehicle management ────────────────────────────────────────────────────
  openAddVehicle(): void {
    this.vehicleForm.reset({ type: 'car' });
    this.showAddVehicle.set(true);
  }

  cancelAddVehicle(): void { this.showAddVehicle.set(false); }

  saveVehicle(): void {
    if (this.vehicleForm.invalid) { this.vehicleForm.markAllAsTouched(); return; }
    const { plate, brand, model, color, type } = this.vehicleForm.value as {
      plate: string; brand: string; model: string; color: string; type: VehicleType;
    };
    this.profileSvc.addVehicle({
      plate: plate.toUpperCase().trim(),
      brand, model, color, type,
      isDefault: false,
    });
    this.showAddVehicle.set(false);
  }

  removeVehicle(id: string): void { this.profileSvc.removeVehicle(id); }

  setDefault(id: string): void { this.profileSvc.setDefaultVehicle(id); }

  // ── Helpers ───────────────────────────────────────────────────────────────
  isInvalid(form: FormGroup, field: string): boolean {
    const c = form.get(field);
    return !!(c && c.invalid && c.touched);
  }

  vehicleIcon(type: VehicleType): string {
    return this.vehicleTypes.find((t) => t.value === type)?.icon ?? '🚗';
  }

  formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
