// import { inject } from '@angular/core';
// import { CanActivateFn, Router } from '@angular/router';
// import { map, tap } from 'rxjs';
// import { AuthService } from '../services/auth.service';

// export const authGuard: CanActivateFn = (route, state) => {
//   const authService = inject(AuthService);
//   const router = inject(Router);

//   return authService.validateSession().pipe(
//     tap((isAuthenticated) => {
//       console.log('isAuthenticated', isAuthenticated);
//       if (!isAuthenticated) {
//         router.navigate(['/auth/login']); // Redirección si no está autenticado
//       }
//     }),
//     map((isAuthenticated) => isAuthenticated) // Devuelve true o false
//   );
// };
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  console.log(state);
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.validateSession().pipe(
    map((isAuth) => {
      if (isAuth) return true;
      // ojo: ruta de login según tu app-routing es /auth/login
      return router.createUrlTree(['/auth/login'], {
        queryParams: { redirectTo: state.url }, // útil para volver luego del login
      });
    })
  );
};
