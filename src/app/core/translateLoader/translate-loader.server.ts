import { TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export class FileSystemTranslateLoader implements TranslateLoader {
  constructor(private prefix: string, private suffix: string = '.json') {}

  getTranslation(lang: string): Observable<any> {
    try {
      const filePath = join(process.cwd(), this.prefix, `${lang}${this.suffix}`);
      const content = readFileSync(filePath, 'utf8');
      return of(JSON.parse(content));
    } catch (e) {
      console.warn(`[SSR] Could not load translation file for lang: ${lang}`, e);
      return of({});
    }
  }
}

export function fileSystemTranslateLoader() {
  return new FileSystemTranslateLoader('public/assets/i18n');
}
