/// <reference types="@angular/localize" />

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { environments } from './environments/environments';
import { AppModule } from './app/app.module';
import { enableProdMode } from '@angular/core';

if (environments.production) {
  enableProdMode();
  // Desactiva logs y debug, pero conserva errores/warnings
  console.log = () => {};
  console.debug = () => {};
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
