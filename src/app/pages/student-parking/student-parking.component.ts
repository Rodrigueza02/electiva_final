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
import { ParkingService } from '../../services/parking.service';
import { ProfileService } from '../../services/profile.service';
import { ParkingSpot } from '../../models/parking-spot.model';

type ViewState = 'map' | 'form' | 'success';

@Component({
  selector: 'app-student-parking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './student-parking.component.html',
  styleUrl: './student-parking.component.scss',
})
export class StudentParkingComponent {
  private readonly auth       = inject(AuthService);
  private readonly parking    = inject(ParkingService);
  private readonly profileSvc = inject(ProfileService);
  private readonly router     = inject(Router);
  private readonly fb         = inject(FormBuilder);

  // ── Data ─────────────────────────────────────────────────────────────────
  readonly user    = this.auth.user;
  readonly spots   = this.parking.spots;
  readonly summary = this.parking.summary;
  readonly profile = this.profileSvc.profile;

  // ── View state machine: map → form → success ──────────────────────────
  readonly view           = signal<ViewState>('map');
  readonly selectedSpot   = signal<ParkingSpot | null>(null);
  readonly confirmedSpot  = signal<ParkingSpot | null>(null);
  readonly entryTimestamp = signal<string>('');

  // ── Rows for the parking map (2 rows of 6) ────────────────────────────
  readonly mapRows = computed(() => {
    const all = this.spots();
    return [all.slice(0, 6), all.slice(6, 12)];
  });

  // ── Default vehicle plate from profile ───────────────────────────────
  private get defaultPlate(): string {
    return (
      this.profile()?.vehicles.find((v) => v.isDefault)?.plate ?? ''
    );
  }

  // ── Entry form ────────────────────────────────────────────────────────
  readonly entryForm: FormGroup = this.fb.group({
    plate: [
      '',
      [Validators.required, Validators.pattern(/^[A-Z0-9]{3,8}$/i)],
    ],
    qrCode: ['', Validators.required],
  });

  // ── Select a spot from the map ────────────────────────────────────────
  selectSpot(spot: ParkingSpot): void {
    if (spot.status !== 'available') return;
    this.selectedSpot.set(spot);
    this.entryForm.reset({
      plate:  this.defaultPlate,
      qrCode: spot.qrCode,
    });
    this.view.set('form');
  }

  backToMap(): void {
    this.selectedSpot.set(null);
    this.view.set('map');
  }

  // ── Confirm entry ─────────────────────────────────────────────────────
  confirmEntry(): void {
    if (this.entryForm.invalid) {
      this.entryForm.markAllAsTouched();
      return;
    }

    const { plate, qrCode } = this.entryForm.value as {
      plate: string;
      qrCode: string;
    };
    const spot = this.selectedSpot();
    if (!spot) return;

    // Validate QR
    if (spot.qrCode !== qrCode.trim()) {
      this.entryForm.get('qrCode')?.setErrors({ mismatch: true });
      return;
    }

    const now = new Date().toISOString();
    this.parking.occupySpot(spot.id, plate);

    // Add to student history
    this.profileSvc.addParkingRecord({
      spotNumber:    spot.spotNumber,
      vehiclePlate:  plate.toUpperCase().trim(),
      entryTime:     now,
    });

    this.entryTimestamp.set(now);
    this.confirmedSpot.set({ ...spot, status: 'occupied', vehiclePlate: plate });
    this.view.set('success');
  }

  // ── Release my spot ───────────────────────────────────────────────────
  releaseMySpot(): void {
    const spot = this.confirmedSpot();
    if (!spot) return;
    this.parking.releaseSpot(spot.id);
    this.confirmedSpot.set(null);
    this.selectedSpot.set(null);
    this.view.set('map');
  }

  // ── Helpers ───────────────────────────────────────────────────────────
  isFieldInvalid(field: string): boolean {
    const c = this.entryForm.get(field);
    return !!(c && c.invalid && c.touched);
  }

  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('es-CO', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
