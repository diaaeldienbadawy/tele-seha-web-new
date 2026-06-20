import { HttpClient } from "@angular/common/http";

export function customTranslateLoader(http: HttpClient) {
  return {
    getTranslation: (lang: string) => {
      return http.get(`assets/i18n/${lang}.json`);
    }
  };
}
