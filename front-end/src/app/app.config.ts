import { ApplicationConfig, LOCALE_ID, provideEnvironmentInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideNativeDateAdapter } from '@angular/material/core';
import ptBR from '@angular/common/locales/pt';
import { provideFlatpickrDefaults } from 'angularx-flatpickr';
import { Portuguese } from 'flatpickr/dist/l10n/pt.js';
import confirmDate from 'flatpickr/dist/plugins/confirmDate/confirmDate.js';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { disableAutocompleteGlobal } from '@utils/autocomplete';

registerLocaleData(ptBR);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideEnvironmentNgxMask({
      dropSpecialCharacters: false
    }),
    provideNativeDateAdapter(),
    provideFlatpickrDefaults({
      enableTime: true,
      time24hr: true,
      altInput: true,
      altFormat: 'd/m/Y H:i',
      dateFormat: 'Y-m-d\\TH:i:00',
      locale: Portuguese,
      utc: false,
      plugins: [
        confirmDate({
          showAlways: true,
          theme: 'light',
          confirmText: 'Selecionar'
        })
      ]
    }),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    provideEnvironmentInitializer(disableAutocompleteGlobal()),
    provideRouter(routes)
  ]
};
