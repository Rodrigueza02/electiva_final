export type VehicleType = 'car' | 'motorcycle' | 'bicycle';

export interface StudentVehicle {
  id: string;           // UUID-like, e.g. "v-001"
  plate: string;        // e.g. "ABC123"
  brand: string;        // e.g. "Mazda"
  model: string;        // e.g. "CX-5"
  color: string;
  type: VehicleType;
  isDefault: boolean;   // vehicle shown first in forms
}

export interface ParkingRecord {
  id: string;
  spotNumber: string;   // e.g. "P-03"
  vehiclePlate: string;
  entryTime: string;    // ISO string
  exitTime?: string;    // ISO string — undefined if still parked
  durationMinutes?: number;
}

export interface StudentProfile {
  userId: string;       // matches AuthUser.email
  code: string;         // student code, e.g. "2023-10-0421"
  program: string;      // degree program
  semester: number;
  campus: string;
  phone: string;
  avatarInitials: string; // derived from name, e.g. "JR"
  vehicles: StudentVehicle[];
  parkingHistory: ParkingRecord[];
}

/** Build a fresh empty profile tied to a user */
export function createEmptyProfile(userId: string, name: string): StudentProfile {
  const parts = name.trim().split(' ');
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : parts[0].substring(0, 2).toUpperCase();

  return {
    userId,
    code: '',
    program: '',
    semester: 1,
    campus: 'Pasto',
    phone: '',
    avatarInitials: initials,
    vehicles: [],
    parkingHistory: [],
  };
}
