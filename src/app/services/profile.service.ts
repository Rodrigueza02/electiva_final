import { Injectable, computed, inject, signal } from '@angular/core';
import {
  ParkingRecord,
  StudentProfile,
  StudentVehicle,
  VehicleType,
  createEmptyProfile,
} from '../models/student-profile.model';
import { AuthService } from './auth.service';

const STORAGE_KEY = 'spu-profiles';

// ── Seed data for the two demo users ────────────────────────────────────────
function buildSeedProfiles(): Record<string, StudentProfile> {
  return {
    'admin@ucc.edu.co': {
      userId: 'admin@ucc.edu.co',
      code: '2023-10-0421',
      program: 'Ingeniería de Sistemas',
      semester: 8,
      campus: 'Pasto',
      phone: '3001234567',
      avatarInitials: 'AU',
      vehicles: [
        {
          id: 'v-001',
          plate: 'ABC123',
          brand: 'Mazda',
          model: 'CX-5',
          color: 'Gris',
          type: 'car',
          isDefault: true,
        },
        {
          id: 'v-002',
          plate: 'MTO456',
          brand: 'Honda',
          model: 'CB125',
          color: 'Negro',
          type: 'motorcycle',
          isDefault: false,
        },
      ],
      parkingHistory: [
        {
          id: 'r-001',
          spotNumber: 'P-03',
          vehiclePlate: 'ABC123',
          entryTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          exitTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          durationMinutes: 120,
        },
        {
          id: 'r-002',
          spotNumber: 'P-07',
          vehiclePlate: 'MTO456',
          entryTime: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
          exitTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          durationMinutes: 90,
        },
        {
          id: 'r-003',
          spotNumber: 'P-01',
          vehiclePlate: 'ABC123',
          entryTime: new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString(),
          exitTime: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          durationMinutes: 75,
        },
      ],
    },
    'operador@ucc.edu.co': {
      userId: 'operador@ucc.edu.co',
      code: '2022-05-0188',
      program: 'Administración de Empresas',
      semester: 6,
      campus: 'Pasto',
      phone: '3109876543',
      avatarInitials: 'OP',
      vehicles: [
        {
          id: 'v-003',
          plate: 'XYZ789',
          brand: 'Chevrolet',
          model: 'Spark',
          color: 'Blanco',
          type: 'car',
          isDefault: true,
        },
      ],
      parkingHistory: [],
    },
  };
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly auth = inject(AuthService);

  // ── All profiles map (userId → profile) ─────────────────────────────────
  private readonly _profiles = signal<Record<string, StudentProfile>>(
    this.loadFromStorage()
  );

  // ── Current user's profile (derived signal) ──────────────────────────────
  readonly profile = computed<StudentProfile | null>(() => {
    const user = this.auth.user();
    if (!user) return null;
    return this._profiles()[user.email] ?? null;
  });

  // ── Update general info ──────────────────────────────────────────────────
  updateInfo(patch: Partial<StudentProfile>): void {
    const user = this.auth.user();
    if (!user) return;
    this._profiles.update((map) => ({
      ...map,
      [user.email]: { ...map[user.email], ...patch },
    }));
    this.persist();
  }

  // ── Vehicle CRUD ─────────────────────────────────────────────────────────
  addVehicle(v: Omit<StudentVehicle, 'id'>): void {
    const user = this.auth.user();
    if (!user) return;
    const newVehicle: StudentVehicle = {
      ...v,
      id: `v-${Date.now()}`,
      isDefault: this._profiles()[user.email]?.vehicles.length === 0,
    };
    this._profiles.update((map) => ({
      ...map,
      [user.email]: {
        ...map[user.email],
        vehicles: [...(map[user.email]?.vehicles ?? []), newVehicle],
      },
    }));
    this.persist();
  }

  removeVehicle(id: string): void {
    const user = this.auth.user();
    if (!user) return;
    this._profiles.update((map) => ({
      ...map,
      [user.email]: {
        ...map[user.email],
        vehicles: map[user.email].vehicles.filter((v) => v.id !== id),
      },
    }));
    this.persist();
  }

  setDefaultVehicle(id: string): void {
    const user = this.auth.user();
    if (!user) return;
    this._profiles.update((map) => ({
      ...map,
      [user.email]: {
        ...map[user.email],
        vehicles: map[user.email].vehicles.map((v) => ({
          ...v,
          isDefault: v.id === id,
        })),
      },
    }));
    this.persist();
  }

  // ── Add a parking record (called from ParkingService) ────────────────────
  addParkingRecord(record: Omit<ParkingRecord, 'id'>): void {
    const user = this.auth.user();
    if (!user) return;
    const newRecord: ParkingRecord = { ...record, id: `r-${Date.now()}` };
    this._profiles.update((map) => ({
      ...map,
      [user.email]: {
        ...map[user.email],
        parkingHistory: [
          newRecord,
          ...(map[user.email]?.parkingHistory ?? []),
        ],
      },
    }));
    this.persist();
  }

  // ── Ensure a profile exists for the logged-in user ───────────────────────
  ensureProfile(email: string, name: string): void {
    if (!this._profiles()[email]) {
      this._profiles.update((map) => ({
        ...map,
        [email]: createEmptyProfile(email, name),
      }));
      this.persist();
    }
  }

  // ── Persistence ──────────────────────────────────────────────────────────
  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._profiles()));
    } catch { /* noop */ }
  }

  private loadFromStorage(): Record<string, StudentProfile> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, StudentProfile>;
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch { /* noop */ }
    return buildSeedProfiles();
  }
}
