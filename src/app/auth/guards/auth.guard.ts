import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { map, tap } from "rxjs";

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  //console.log("en el guard", state);

  return authService.validateSession()
  .pipe(
    tap(isAuthenticated => {
      console.log("isAuthenticated", isAuthenticated);
      if (!isAuthenticated) {
        router.navigate(['/login']); // Redirección si no está autenticado
      }
    }),
    map(isAuthenticated => isAuthenticated) // Devuelve true o false
  );
};
