import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParkingSpot } from '../../models/parking-spot.model';

@Component({
  selector: 'app-slot-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './slot-card.component.html',
  styleUrl: './slot-card.component.scss',
})
export class SlotCardComponent {
  // ── Inputs (signal-based input API — Angular 17+) ─────────────────────
  spot = input.required<ParkingSpot>();

  // ── Outputs ──────────────────────────────────────────────────────────
  occupy  = output<number>();
  release = output<number>();
  reserve = output<number>();

  // ── Helpers ──────────────────────────────────────────────────────────
  get statusLabel(): string {
    const map: Record<string, string> = {
      available: 'Disponible',
      occupied:  'Ocupado',
      reserved:  'Reservado',
    };
    return map[this.spot().status] ?? this.spot().status;
  }

  get formattedEntry(): string {
    const t = this.spot().entryTime;
    if (!t) return '—';
    return new Date(t).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  onOccupy():  void { this.occupy.emit(this.spot().id); }
  onRelease(): void { this.release.emit(this.spot().id); }
  onReserve(): void { this.reserve.emit(this.spot().id); }
}
