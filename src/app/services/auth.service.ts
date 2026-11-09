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

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _user = signal<AuthUser | null>(this.loadSession());

  readonly user       = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly isAdmin    = computed(() => this._user()?.role === 'admin');
  readonly isStudent  = computed(() => this._user()?.role === 'student');

  login(email: string, password: string): boolean {
    const found = DEMO_USERS.find(
      (u) => u.email === email.trim().toLowerCase() && u.password === password
    );
    if (!found) return false;

    const { password: _pw, ...user } = found;
    this._user.set(user);
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(user)); } catch { /* noop */ }
    return true;
  }

  logout(): void {
    this._user.set(null);
    try { localStorage.removeItem(SESSION_KEY); } catch { /* noop */ }
  }

  /** Registra un nuevo estudiante — retorna 'created' | 'email-exists' | 'error' */
  async registerStudent(
    name: string,
    email: string,
    password: string
  ): Promise<'created' | 'email-exists' | 'error'> {
    try {
      const raw = localStorage.getItem('spu-registered-users');
      const users: Array<AuthUser & { password: string }> = raw ? JSON.parse(raw) : [];
      if (users.some((u) => u.email === email)) return 'email-exists';
      const newUser: AuthUser & { password: string } = {
        email, name, role: 'student', password,
      };
      users.push(newUser);
      localStorage.setItem('spu-registered-users', JSON.stringify(users));
      const { password: _pw, ...authUser } = newUser;
      this._user.set(authUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
      return 'created';
    } catch { return 'error'; }
  }

  private loadSession(): AuthUser | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch { return null; }
  }
}
