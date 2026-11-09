import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ParkingService } from '../../services/parking.service';
import { AuthService } from '../../services/auth.service';
import { SlotCardComponent } from '../../components/slot-card/slot-card.component';
import { SpotStatus } from '../../models/parking-spot.model';

type FilterOption = 'all' | SpotStatus;

interface FilterDef {
  value: FilterOption;
  label: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SlotCardComponent, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly parkingService = inject(ParkingService);
  private readonly authService    = inject(AuthService);
  private readonly router         = inject(Router);
  private readonly fb             = inject(FormBuilder);

  // ── Auth ─────────────────────────────────────────────────────────────────
  readonly currentUser = this.authService.user;

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // ── Summary & raw spots from service ────────────────────────────────────
  readonly summary = this.parkingService.summary;
  readonly allSpots = this.parkingService.spots;

  // ── Filter state ─────────────────────────────────────────────────────────
  readonly activeFilter = signal<FilterOption>('all');

  readonly filters: FilterDef[] = [
    { value: 'all',       label: 'Todos' },
    { value: 'available', label: 'Disponibles' },
    { value: 'occupied',  label: 'Ocupados' },
    { value: 'reserved',  label: 'Reservados' },
  ];

  // ── Derived filtered list ────────────────────────────────────────────────
  readonly filteredSpots = computed(() => {
    const f = this.activeFilter();
    return f === 'all'
      ? this.allSpots()
      : this.allSpots().filter((s) => s.status === f);
  });

  // ── Occupy modal state ───────────────────────────────────────────────────
  readonly showModal  = signal(false);
  readonly targetSpotId = signal<number | null>(null);
  modalError = signal<string | null>(null);

  // ── Reactive form ────────────────────────────────────────────────────────
  readonly occupyForm: FormGroup = this.fb.group({
    qrCode:  ['', [Validators.required]],
    plate:   ['', [Validators.required, Validators.pattern(/^[A-Z0-9]{3,8}$/i)]],
  });

  // ── Filter actions ────────────────────────────────────────────────────────
  setFilter(f: FilterOption): void {
    this.activeFilter.set(f);
  }

  // ── Card event handlers ───────────────────────────────────────────────────
  onOccupy(id: number): void {
    const spot = this.allSpots().find((s) => s.id === id);
    if (!spot) return;
    this.targetSpotId.set(id);
    this.occupyForm.reset({ qrCode: spot.qrCode, plate: '' });
    this.modalError.set(null);
    this.showModal.set(true);
  }

  onRelease(id: number): void {
    this.parkingService.releaseSpot(id);
  }

  onReserve(id: number): void {
    this.parkingService.reserveSpot(id);
  }

  // ── Modal actions ─────────────────────────────────────────────────────────
  submitOccupy(): void {
    if (this.occupyForm.invalid) {
      this.occupyForm.markAllAsTouched();
      return;
    }

    const { qrCode, plate } = this.occupyForm.value as { qrCode: string; plate: string };
    const id = this.targetSpotId();

    // Validate QR matches the target spot
    const spot = this.allSpots().find((s) => s.id === id);
    if (!spot || spot.qrCode !== qrCode.trim()) {
      this.modalError.set('El código QR no coincide con el puesto seleccionado.');
      return;
    }

    this.parkingService.occupySpot(id!, plate);
    this.closeModal();
  }

  closeModal(): void {
    this.showModal.set(false);
    this.targetSpotId.set(null);
    this.occupyForm.reset();
    this.modalError.set(null);
  }

  // ── Template helper ───────────────────────────────────────────────────────
  get targetSpotNumber(): string {
    const id = this.targetSpotId();
    return this.allSpots().find((s) => s.id === id)?.spotNumber ?? '';
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.occupyForm.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }
}
