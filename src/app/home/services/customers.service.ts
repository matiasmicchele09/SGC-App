import { inject, Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { enviroments } from 'src/environments/environments'
import { catchError, Observable, tap, throwError } from "rxjs";
import { Customer } from "../interfaces/customers.interface";
import { Tax_Condition } from "../interfaces/tax_conditions";
import { Province } from "../interfaces/provinces.interface";

@Injectable({
  providedIn: 'root'
})

export class CustomersService {
  private baseUrl: string = enviroments.baseUrl;
  private tax_conditions: Tax_Condition[] = [];
  private http = inject(HttpClient);

  constructor() { }

  //* Condición Fiscal
  getTaxConditions():Observable<Tax_Condition[]>{
    return this.http.get<Tax_Condition[]>(`${this.baseUrl}/tax-conditions`)
    .pipe(
      tap(tax_conditions => console.log(tax_conditions))
    )
  }

  //* Provincias
  getProvinces():Observable<Province[]>{
    return this.http.get<Province[]>(`${this.baseUrl}/provinces`)
    .pipe(
      tap(provinces => console.log(provinces)),
    )
  }

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

  addCustomer(customer: Customer): Observable<Customer> {
    return this.http.post<Customer>(`${this.baseUrl}/customers`, customer)
      .pipe(
        tap((newCustomer: Customer) => console.log('added customer', newCustomer)),
        catchError(this.handleError)
      );
  }

  updateCustomer(customer: Customer): Observable<Customer> {
    return this.http.put<Customer>(`${this.baseUrl}/customers/${customer.id}`, customer)
      .pipe(
        tap((updatedCustomer: Customer) => console.log('updated customer', updatedCustomer)),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('An error occurred:', error.message);
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
}
