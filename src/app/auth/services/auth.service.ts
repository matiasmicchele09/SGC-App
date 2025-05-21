import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { enviroments } from 'src/environments/environments'
import { User } from '../interfaces/user.interface';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl: string = enviroments.baseUrl;
  private _user!: User | null;

  //getter para obtener el usuario de la variable privada
  get user():User | null {
    return this._user ? { ...this._user } : null;
  }

  constructor(private http: HttpClient) {
    // this.getCurrentUser().subscribe(user => {
    //   console.log("user", user);
    //   this._user = user;
    // });
  }

  login(email: string, pass: string): Observable<User> {
    const body = { email, pass };
    return this.http.post<User>(`${this.baseUrl}/login`, body, { withCredentials: true })
      .pipe(
        tap(user => console.log("user", user)),
        tap(user => this._user = user),
        catchError(this.handleError)
      )
  }

  getCurrentUser(): Observable<User | null> {
  return this.http.get<User>(`${this.baseUrl}/me`, { withCredentials: true }).pipe(
    tap(user => this._user = user),
    catchError(err => {
      this._user = null;
      return of(null); // Si no está autenticado
    })
  );
}


  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/users/${id}`)
    .pipe(
      tap(user => {
        this._user = user;
        console.log("user", user);
      }),
      // catchError((error: HttpErrorResponse) => {
      //   console.error('Error al obtener el usuario:', error);
      //   return of(null); // o manejar el error de otra manera
      // })
    )


  }



  validateSession(): Observable<boolean> {
    return this.http.get<User>(`${this.baseUrl}/validateSession`, { withCredentials: true })
      .pipe(
        tap(user => {
          this._user = user
        }),
        map(user => {
          const isAuthenticated = !!user;
          return isAuthenticated;
        }), // Si existe el usuario, devuelve true, sino false
        catchError((error) => {
          console.log("Error en validateSession:", error);
          return of(false)
        }) // Si falla, simplemente devuelve false
      );
    }


  private handleError(error: HttpErrorResponse): Observable<never> {    ;
    //return throwError('Something went wrong; please try again later.');
    return throwError(() => new Error('Error en la autenticación'));
  }

  // register(email: string, pass: string, name: string): Observable<User> {
  //   return this.http.post<User>(`${this.baseUrl}/auth/register`, { email, pass, name })
  //     .pipe(
  //       tap(user => this._user = user)
  //     )
  // }

  logout(): void {
    this._user = null;
    this.http.post(`${this.baseUrl}/logout`, {}, { withCredentials: true }).subscribe();
  }
}
