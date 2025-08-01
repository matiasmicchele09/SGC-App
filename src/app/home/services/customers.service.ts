import { inject, Injectable, Type } from "@angular/core";
import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { environments } from 'src/environments/environments'
import { catchError, Observable, tap, throwError } from "rxjs";
import { Customer } from "../interfaces/customers.interface";
import { Tax_Condition } from "../interfaces/tax_conditions";
import { Province } from "../interfaces/provinces.interface";
import { Bank } from "../interfaces/banks.interface";
import { Type_Person } from "../interfaces/types_persons";

@Injectable({
  providedIn: 'root'
})

export class CustomersService {
  private baseUrl: string = environments.baseUrl;
  private tax_conditions: Tax_Condition[] = [];
  private http = inject(HttpClient);

  constructor() { }

  //* Condición Fiscal
  getTaxConditions():Observable<Tax_Condition[]>{
    return this.http.get<Tax_Condition[]>(`${this.baseUrl}/tax-conditions`)
  }

  //* Provincias
  getProvinces():Observable<Province[]>{
    return this.http.get<Province[]>(`${this.baseUrl}/provinces`)
  }

  getBanks():Observable<Bank[]>{
    return this.http.get<Bank[]>(`${this.baseUrl}/banks`)
  }

  getTypesPerson():Observable<Type_Person[]>{
    return this.http.get<Type_Person[]>(`${this.baseUrl}/types_person`)
  }

  getCustomers(id_user: number): Observable<Customer[]>  {

    const params = new HttpParams().set('id_user', id_user);
    //console.log( params);

    return this.http.get<Customer[]>(`${this.baseUrl}/customers`,{ params })
      .pipe(
        //tap(customers=> console.log("customers", customers)),
        catchError(this.handleError)
      );
  }

  addCustomer(customer: Customer, isNew:boolean): Observable<Customer> {
    if (isNew){
      return this.http.post<Customer>(`${this.baseUrl}/customers`, customer)
        .pipe(
          tap((newCustomer: Customer) => console.log('added customer', newCustomer)),
          catchError(this.handleError)
        );
    }
    else{
      return this.http.put<Customer>(`${this.baseUrl}/customers/${customer.id}`, customer)
      .pipe(
        tap((updatedCustomer: Customer) => console.log('updated customer', updatedCustomer)),
        catchError(this.handleError)
      );
    }
  }
  // addCustomer(customer: Customer): Observable<Customer> {
  //   return this.http.post<Customer>(`${this.baseUrl}/customers`, customer)
  //     .pipe(
  //       tap((newCustomer: Customer) => console.log('added customer', newCustomer)),
  //       catchError(this.handleError)
  //     );
  // }

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
