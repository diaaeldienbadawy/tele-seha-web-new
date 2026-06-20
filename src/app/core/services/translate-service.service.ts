import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class TranslateServiceService {
  private langSubject = new BehaviorSubject<string>('en');
  lang$ = this.langSubject.asObservable();

  private dirSubject = new BehaviorSubject<'ltr' | 'rtl'>('ltr');
  dir$ = this.dirSubject.asObservable();

  constructor(
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    let defaultLang = 'en';
    let direction: 'ltr' | 'rtl' = 'ltr';

    if (isPlatformBrowser(this.platformId)) {
      const savedLang = localStorage.getItem('lang');
      const savedDir = localStorage.getItem('dir') as 'ltr' | 'rtl' | null;

      if (savedLang) defaultLang = savedLang;
      if (savedDir) direction = savedDir;
    }

    this.translate.setDefaultLang(defaultLang);
    this.translate.use(defaultLang);
    this.applyDirection(direction);

    // 👇 الحالة الأساسية
    this.langSubject.next(defaultLang);
    this.dirSubject.next(direction);
  }

  useLanguage(lang: string) {
    const dir: 'ltr' | 'rtl' = lang === 'ar' ? 'rtl' : 'ltr';

    this.translate.use(lang);
    this.applyDirection(dir);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('lang', lang);
      localStorage.setItem('dir', dir);
    }

    // 👇 نبلغ كل الـ components
    this.langSubject.next(lang);
    this.dirSubject.next(dir);
  }

  applyDirection(direction: 'ltr' | 'rtl') {
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.dir = direction;
      document.documentElement.classList.remove('rtl', 'ltr');
      document.documentElement.classList.add(direction);
    }
  }

  getCurrentLanguage(): string {
    return this.langSubject.value;
  }

  getCurrentDir(): 'ltr' | 'rtl' {
    return this.dirSubject.value;
  }
}
