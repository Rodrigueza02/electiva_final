import { Injectable, signal, computed } from '@angular/core';

export type UserRole = 'admin' | 'student';

export interface AuthUser {
  email: string;
  name: string;
  role: UserRole;
  /** Optional photo URL — falls back to initials avatar */
  photoUrl?: string;
}

// Demo credentials — replace with a real backend call in production
const DEMO_USERS: Array<AuthUser & { password: string }> = [
  {
    email:    'admin@ucc.edu.co',
    password: 'admin123',
    name:     'Administrador UCC',
    role:     'admin',
  },
  {
    email:    'estudiante@campusucc.edu.co',
    password: 'est123',
    name:     'Estudiante UCC',
    role:     'student',
  },
];

const SESSION_KEY = 'spu-session';
const REGISTERED_ACCOUNTS_KEY = 'spu-registered-accounts';

interface StoredStudentAccount {
  user: AuthUser;
  salt: string;
  passwordHash: string;
}

export type StudentRegistrationResult = 'created' | 'email-exists' | 'unavailable';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _user = signal<AuthUser | null>(this.loadSession());

  readonly user       = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly isAdmin    = computed(() => this._user()?.role === 'admin');
  readonly isStudent  = computed(() => this._user()?.role === 'student');

  async login(email: string, password: string): Promise<boolean> {
    const normalizedEmail = email.trim().toLowerCase();
    const demoUser = DEMO_USERS.find(
      (user) => user.email === normalizedEmail && user.password === password
    );
    if (demoUser) {
      const { password: _password, ...user } = demoUser;
      this.startSession(user);
      return true;
    }

    const account = this.loadRegisteredAccounts().find(
      (registered) => registered.user.email === normalizedEmail
    );
    if (!account) return false;

    try {
      const salt = this.fromHex(account.salt);
      if (salt.length !== 16) return false;
      const passwordHash = await this.hashPassword(password, salt);
      if (passwordHash !== account.passwordHash) return false;
      this.startSession(account.user);
      return true;
    } catch {
      return false;
    }
  }

  async registerStudent(
    name: string,
    email: string,
    password: string
  ): Promise<StudentRegistrationResult> {
    const normalizedEmail = email.trim().toLowerCase();
    const accounts = this.loadRegisteredAccounts();
    if (
      DEMO_USERS.some((user) => user.email === normalizedEmail) ||
      accounts.some((account) => account.user.email === normalizedEmail)
    ) {
      return 'email-exists';
    }

    try {
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const user: AuthUser = {
        email: normalizedEmail,
        name: name.trim(),
        role: 'student',
      };
      const account: StoredStudentAccount = {
        user,
        salt: this.toHex(salt),
        passwordHash: await this.hashPassword(password, salt),
      };
      localStorage.setItem(
        REGISTERED_ACCOUNTS_KEY,
        JSON.stringify([...accounts, account])
      );
      this.startSession(user);
      return 'created';
    } catch {
      return 'unavailable';
    }
  }

  logout(): void {
    this._user.set(null);
    try { localStorage.removeItem(SESSION_KEY); } catch { /* noop */ }
  }

  private loadSession(): AuthUser | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch { return null; }
  }

  private startSession(user: AuthUser): void {
    this._user.set(user);
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(user)); } catch { /* noop */ }
  }

  private loadRegisteredAccounts(): StoredStudentAccount[] {
    try {
      const raw = localStorage.getItem(REGISTERED_ACCOUNTS_KEY);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      return parsed.filter((value): value is StoredStudentAccount => {
        if (typeof value !== 'object' || value === null) return false;
        const account = value as Partial<StoredStudentAccount>;
        const user = account.user;
        return (
          typeof account.salt === 'string' &&
          typeof account.passwordHash === 'string' &&
          typeof user?.email === 'string' &&
          typeof user.name === 'string' &&
          user.role === 'student'
        );
      });
    } catch {
      return [];
    }
  }

  private async hashPassword(password: string, salt: Uint8Array): Promise<string> {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: 120000, hash: 'SHA-256' },
      key,
      256
    );
    return this.toHex(new Uint8Array(bits));
  }

  private toHex(bytes: Uint8Array): string {
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  private fromHex(hex: string): Uint8Array {
    const pairs = hex.match(/.{2}/g) ?? [];
    return new Uint8Array(pairs.map((pair) => Number.parseInt(pair, 16)));
  }
}
