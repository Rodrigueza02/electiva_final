export type SpotStatus = 'available' | 'occupied' | 'reserved';

export interface ParkingSpot {
  id: number;
  spotNumber: string;   // e.g. "P-01"
  qrCode: string;       // simulated QR identifier per spot
  status: SpotStatus;
  vehiclePlate?: string;
  entryTime?: string;   // ISO string
}

export interface ParkingSummary {
  total: number;
  available: number;
  occupied: number;
  reserved: number;
}

/** Factory helper to build a fresh available spot */
export function createSpot(
  id: number,
  spotNumber: string,
  qrCode: string
): ParkingSpot {
  return { id, spotNumber, qrCode, status: 'available' };
}
