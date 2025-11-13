// src/app/auth/interceptors/auth-expired.interceptor.ts
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastService } from 'src/app/shared/services/toast.service';

@Injectable()
export class AuthExpiredInterceptor implements HttpInterceptor {
  private showing = false;

  // Endpoints de auth/login que NO deben disparar toast/redirección
  private readonly authUrlPatterns: RegExp[] = [
    /\/login\b/i,
    ///\/me\b/i,
    /\/validateSession\b/i, // <-- importante
    /\/auth\/login\b/i,
    /\/auth\/refresh\b/i, //Esta ruta no la tengo
    /\/auth\/session\b/i, //Esta ruta no la tengo
  ];

  constructor(private router: Router, private toast: ToastService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        console.log(req);
        // Solo manejamos expiración
        if (err && (err.status === 401 || err.status === 419)) {
          const fromAuthUrl = this.isAuthUrl(req.url);
          const onAuthArea = this.isOnAuthArea(); // mejor detector

          console.log('fromAuthUrl', fromAuthUrl);
          console.log('onLoginRoute', onAuthArea);
          // ⚠️ No mostrar toast si:
          // - La request es al endpoint de login/auth
          // - Ya estás en la ruta /login (p.ej. recarga)
          if (!fromAuthUrl && !onAuthArea) {
            this.showOnce('Tu sesión expiró. Iniciá sesión nuevamente.', 7000);
          }

          // Redirigir solo si NO estás ya en /auth
          if (!onAuthArea) {
            this.router.navigate(['/auth/login'], {
              state: { reason: 'expired' },
            });
          }
        }

        return throwError(() => err);
      })
    );
  }

  private isAuthUrl(url: string): boolean {
    console.log(url);
    return this.authUrlPatterns.some((rx) => rx.test(url));
  }

  private isOnAuthArea(): boolean {
    const current = this.router?.url || '';
    // Considerá "/" (estado previo al redirect) y cualquier ruta bajo /auth
    return (
      current === '/' || current === '/auth' || current.startsWith('/auth')
    );
  }

  private showOnce(message: string, delay = 7000) {
    if (this.showing) return;
    this.showing = true;
    this.toast.show(message, { classname: 'bg-danger text-white', delay });
    setTimeout(() => (this.showing = false), delay + 200);
  }
}
