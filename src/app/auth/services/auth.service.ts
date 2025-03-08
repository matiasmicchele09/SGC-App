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
    this.validateSession();
  }

  login(email: string, pass: string): Observable<User> {
    console.log("Login",email, pass);
    const body = { email, pass };
    return this.http.post<User>(`${this.baseUrl}/login`, body, { withCredentials: true })
      .pipe(
        tap(user => this._user = user),
        catchError(this.handleError)
      )
  }

  validateSession(): void {
    this.http.get<User>(`${this.baseUrl}/validateSession`, { withCredentials: true })
      .pipe(
        tap(user => this._user = user),
        catchError(() => of(null)) // Si falla, simplemente deja _user como null
      ).subscribe();
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

  // validateToken(): Observable<boolean> {
  //   return this.http.get<User>(`${this.baseUrl}/auth/renew`)
  //     .pipe(
  //       map(user => {
  //         this._user = user;
  //         return true;
  //       })
  //     )
  // }

  logout(): void {
    this._user = null;
    this.http.post(`${this.baseUrl}/logout`, {}, { withCredentials: true }).subscribe();
  }
}
