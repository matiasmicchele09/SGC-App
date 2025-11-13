import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';

import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgbModule, NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { AuthExpiredInterceptor } from './auth/interceptor/auth-expired.interceptor';
import { AuthInterceptor } from './auth/interceptor/auth.interceptor';
import { ToastsContainerComponent } from './shared/components/toasts/toasts-container.component';
//import { HomeModule } from './home/home.module';

@NgModule({
  declarations: [AppComponent, ToastsContainerComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    NgbToastModule,
    //HomeModule
  ],
  providers: [
    // 1) Agrega withCredentials primero en la ida:
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    // 2) Captura 401/419 en la vuelta:
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthExpiredInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
