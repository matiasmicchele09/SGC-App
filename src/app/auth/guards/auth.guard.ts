import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, tap } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.validateSession().pipe(
    tap((isAuthenticated) => {
      console.log('isAuthenticated', isAuthenticated);
      if (!isAuthenticated) {
        //* pongo aca el cartel de que la sesión expiró??
        router.navigate(['/login']); // Redirección si no está autenticado
      }
    }),
    map((isAuthenticated) => isAuthenticated) // Devuelve true o false
  );
};
