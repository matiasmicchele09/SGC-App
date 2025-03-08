//* El interceptor se utiliza para modificar las peticiones HTTP antes de que se envíen al servidor.
//* En este caso, se utiliza para agregar la propiedad withCredentials a la petición HTTP, lo que permite enviar cookies al servidor.
//* Esto es necesario para que el servidor pueda identificar al usuario y mantener la sesión activa.

import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const clonedReq = req.clone({
      withCredentials: true
    });
    return next.handle(clonedReq);
  }
}
