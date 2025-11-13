/// <reference types="@angular/localize" />

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environments } from './environments/environments';
if (environments.production) {
  enableProdMode();
  // Desactiva logs y debug, pero conserva errores/warnings
  console.log = () => {};
  console.debug = () => {};
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
