import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { enviroments } from 'src/environments/environments'
import { User } from '../interfaces/user.interface';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl: string = enviroments.baseUrl;
  private _user!: User | null;

  //getter para obtener el usuario de la variable privada
  // get user():User | null {
  //   return this._user ? { ...this._user } : null;
  // }

  constructor(private http: HttpClient) {
    // this.getCurrentUser().subscribe(user => {
    //   console.log("user", user);
    //   this._user = user;
    // });
  }

  updateUser(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/users/${id}`, user)
      .pipe(
        tap(user => {
          this._user = user;
          console.log("user", user);
        }),
        catchError(this.handleError)
      )
  }

 private handleError(error: HttpErrorResponse): Observable<never> {    ;
    //return throwError('Something went wrong; please try again later.');
    return throwError(() => new Error('Error en la actualización del usuario: ' + error.message));
  }



}
