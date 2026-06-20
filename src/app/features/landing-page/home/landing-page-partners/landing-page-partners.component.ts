import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import {
  CarouselComponent,
  CarouselModule,
  OwlOptions,
} from 'ngx-owl-carousel-o';
import { TranslateServiceService } from '../../../../core/services/translate-service.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-landing-page-partners',
  imports: [CarouselModule, CommonModule],
  templateUrl: './landing-page-partners.component.html',
  styleUrl: './landing-page-partners.component.css',
})
export class LandingPagePartnersComponent {
  isBrowser = false;

  constructor(
    readonly translateService: TranslateServiceService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  images = [
    '/assets/images/logo (1) 2.png',
    '/assets/images/Group.png',
    '/assets/images/hipaa-compliance-logo-vector 2.png',
    '/assets/images/logo (2) 2.png',
    '/assets/images/logo-01 2.png',
    '/assets/images/LogoAR 2.png',
    '/assets/images/logo-top 2.png',
    '/assets/images/Shape2.png',
  ];

  @ViewChild(CarouselComponent) carousel!: CarouselComponent;

  private sub!: Subscription;

  customOptions!: OwlOptions;

  ngOnInit(): void {
    if (this.isBrowser) {
      this.initCarousel();

      this.sub = this.translateService.dir$.subscribe(() => {
        // 🔥 إعادة تهيئة عند تغيير اللغة
        setTimeout(() => {
          this.initCarousel();
        });
      });
    }
  }

  initCarousel() {
    this.customOptions = {
      loop: true,
      mouseDrag: true,
      touchDrag: true,
      pullDrag: true,
      dots: false,
      autoplay: true,
      autoplayTimeout: 2000,
      navSpeed: 400,
      nav: false,
      rtl: this.translateService.getCurrentDir() === 'rtl',
      responsive: {
        0: { items: 2 },
        640: { items: 3 },
        1024: { items: 5 },
      },
    };
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
