import { inject, Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
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

  getCustomers(id_user: number): Observable<Customer[]>  {
    //const body = { id_user };
    //id_user = 2;
    const params = new HttpParams().set('id_user', id_user);
    console.log(params);

    //console.log(body);

    return this.http.get<Customer[]>(`${this.baseUrl}/customers`,{ params })
      .pipe(
        tap(customers=> console.log("customers", customers)),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('An error occurred:', error.message);
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }

  addCustomer(customer: Customer, isNew: boolean): Observable<Customer> {
    if (isNew) {

      return this.http.post<Customer>(`${this.baseUrl}/customers`, customer)
            .pipe(
              tap((newCustomer: Customer) => console.log('added customer', newCustomer)),
              catchError(this.handleError)
            );
  }
  else {
    return this.http.put<Customer>(`${this.baseUrl}/customers/${customer.id}`, customer)
      .pipe(
        tap((updatedCustomer: Customer) => console.log('updated customer', updatedCustomer)),
        catchError(this.handleError)
      );
  }
  }

}
