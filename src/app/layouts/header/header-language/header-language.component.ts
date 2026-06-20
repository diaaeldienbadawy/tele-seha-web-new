import { Component, OnInit } from '@angular/core';
import { TranslateServiceService } from '../../../core/services/translate-service.service';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';

interface Language {
  label: string;
  value: string;
}

@Component({
  selector: 'app-header-language',
  imports: [FormsModule, TranslateModule , Select],
  templateUrl: './header-language.component.html',
  styleUrl: './header-language.component.css',
})
export class HeaderLanguageComponent implements OnInit {
  languages: Language[] = [
    { label: 'EN', value: 'en' },
    { label: 'AR', value: 'ar' },
  ];

  selectedLang = 'en';

  constructor(private translaservice: TranslateServiceService) {
    this.selectedLang = this.translaservice.getCurrentLanguage();
  }

  ngOnInit(): void {}

  switchLanguage(lang: string) {
    console.log(lang);
    this.selectedLang = lang;
    this.translaservice.useLanguage(lang);
  }
}
