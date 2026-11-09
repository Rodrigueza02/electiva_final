import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, UserRole } from '../services/auth.service';

/** Requiere sesión activa */
export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() ? true : router.createUrlTree(['/login']);
};

/** Redirige al dashboard si ya tiene sesión */
export const guestGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) return true;
  return auth.isStudent()
    ? router.createUrlTree(['/parking'])
    : router.createUrlTree(['/dashboard']);
};

/** Requiere uno o más roles específicos */
export function roleGuard(...roles: UserRole[]): CanActivateFn {
  return () => {
    const auth   = inject(AuthService);
    const router = inject(Router);
    if (!auth.isLoggedIn()) return router.createUrlTree(['/login']);
    const userRole = auth.user()?.role;
    if (userRole && roles.includes(userRole)) return true;
    // Redirige según el rol que tiene
    return auth.isStudent()
      ? router.createUrlTree(['/parking'])
      : router.createUrlTree(['/dashboard']);
  };
}
