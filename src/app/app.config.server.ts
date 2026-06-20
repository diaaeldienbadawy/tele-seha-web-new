import { mergeApplicationConfig, ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideServerRouting } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { fileSystemTranslateLoader } from './core/translateLoader/translate-loader.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideServerRouting(serverRoutes),
    // Override the HTTP-based translate loader with a filesystem loader for SSR
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: fileSystemTranslateLoader,
        },
      })
    ),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
