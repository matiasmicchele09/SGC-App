import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { enviroments } from 'src/environments/environments'
import { User } from '../interfaces/user.interface';
import { Observable, catchError, map, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl: string = enviroments.baseUrl;
  private _user!: User;

  get user() {
    return { ...this._user };
  }

  constructor(private http: HttpClient) { }

  login(email: string, pass: string): Observable<User> {
    //console.log("Login",email, pass);
    const body = { email, pass };
    return this.http.post<User>(`${this.baseUrl}/login`, body)
      .pipe(
        tap(user => this._user = user),
        catchError(this.handleError)
      )
  }

  private handleError(error: HttpErrorResponse): Observable<never> {    ;
    //return throwError('Something went wrong; please try again later.');
    return throwError(error);
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

  logout() {
    this._user = undefined!;
  }
}
