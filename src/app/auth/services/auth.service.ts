import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { enviroments } from 'src/environments/environments'
import { User } from '../interfaces/user.interface';
import { Observable, map, tap } from 'rxjs';

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
    return this.http.post<User>(`${this.baseUrl}/auth/login`, { email, pass })
      .pipe(
        tap(user => this._user = user)
      )
  }

  register(email: string, pass: string, name: string): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/auth/register`, { email, pass, name })
      .pipe(
        tap(user => this._user = user)
      )
  }

  validateToken(): Observable<boolean> {
    return this.http.get<User>(`${this.baseUrl}/auth/renew`)
      .pipe(
        map(user => {
          this._user = user;
          return true;
        })
      )
  }

  logout() {
    this._user = undefined!;
  }
}
