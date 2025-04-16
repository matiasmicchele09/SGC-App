import { inject, Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { enviroments } from 'src/environments/environments'
import { catchError, Observable, tap, throwError } from "rxjs";
import { Customer } from "../interfaces/customers.interface";

@Injectable({
  providedIn: 'root'
})

export class CustomersService {
  private baseUrl: string = enviroments.baseUrl;
  private http = inject(HttpClient);

  constructor() { }

  getCustomers(): Observable<Customer[]>  {
    return this.http.get<Customer[]>(`${this.baseUrl}/customers`)
      .pipe(
        tap(customers=> console.log("customers", customers)),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('An error occurred:', error.message);
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }

}
