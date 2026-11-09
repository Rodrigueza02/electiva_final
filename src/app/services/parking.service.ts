import { Injectable, computed, signal } from '@angular/core';
import {
  ParkingSpot,
  ParkingSummary,
  SpotStatus,
  createSpot,
} from '../models/parking-spot.model';

const STORAGE_KEY = 'smart-park-u-spots';

/** Seed data — 12 spots across two rows */
function buildSeedSpots(): ParkingSpot[] {
  return Array.from({ length: 12 }, (_, i) => {
    const num = String(i + 1).padStart(2, '0');
    return createSpot(i + 1, `P-${num}`, `QR-${num}-${Date.now()}`);
  });
}

@Injectable({ providedIn: 'root' })
export class ParkingService {
  // ── Primary signal ──────────────────────────────────────────────────────
  private readonly _spots = signal<ParkingSpot[]>(this.loadFromStorage());

  // ── Public read-only view ───────────────────────────────────────────────
  readonly spots = this._spots.asReadonly();

  // ── Derived summary ─────────────────────────────────────────────────────
  readonly summary = computed<ParkingSummary>(() => {
    const list = this._spots();
    return {
      total: list.length,
      available: list.filter((s) => s.status === 'available').length,
      occupied: list.filter((s) => s.status === 'occupied').length,
      reserved: list.filter((s) => s.status === 'reserved').length,
    };
  });

  // ── Occupy a spot ────────────────────────────────────────────────────────
  occupySpot(id: number, vehiclePlate: string): void {
    this.updateSpot(id, {
      status: 'occupied',
      vehiclePlate: vehiclePlate.toUpperCase().trim(),
      entryTime: new Date().toISOString(),
    });
  }

  // ── Reserve a spot ───────────────────────────────────────────────────────
  reserveSpot(id: number): void {
    this.updateSpot(id, { status: 'reserved', vehiclePlate: undefined, entryTime: undefined });
  }

  // ── Release a spot ───────────────────────────────────────────────────────
  releaseSpot(id: number): void {
    this.updateSpot(id, {
      status: 'available',
      vehiclePlate: undefined,
      entryTime: undefined,
    });
  }

  // ── Find spot by QR code ─────────────────────────────────────────────────
  findByQr(qrCode: string): ParkingSpot | undefined {
    return this._spots().find((s) => s.qrCode === qrCode);
  }

  // ── Internal helpers ─────────────────────────────────────────────────────
  private updateSpot(id: number, patch: Partial<ParkingSpot>): void {
    this._spots.update((list) =>
      list.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );
    this.persist();
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._spots()));
    } catch {
      // Silently skip if storage is unavailable (SSR / private mode)
    }
  }

  private loadFromStorage(): ParkingSpot[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ParkingSpot[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore corrupt data
    }
    return buildSeedSpots();
  }
}
