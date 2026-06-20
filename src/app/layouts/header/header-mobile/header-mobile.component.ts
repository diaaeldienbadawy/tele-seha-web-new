import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Input, Output, EventEmitter, PLATFORM_ID, Inject, DestroyRef, inject } from '@angular/core';
import { TranslateServiceService } from '../../../core/services/translate-service.service';
import { HeaderLogoComponent } from '../header-logo/header-logo.component';
import { MobileNavComponent } from '../mobile-nav/mobile-nav.component';
import { HeaderNotificationComponent } from '../header-notification/header-notification.component';
import { HeaderLanguageComponent } from '../header-language/header-language.component';
import { HeaderprofileComponent } from '../headerprofile/headerprofile.component';
import { GlobalUserStateService } from '../../../core/services/state/global-user-state.service';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-header-mobile',
  imports: [
    RouterLink,
    CommonModule,
    HeaderLogoComponent,
    MobileNavComponent,
    HeaderNotificationComponent,
    HeaderLanguageComponent,
    HeaderprofileComponent,
    TranslateModule,
  ],
  templateUrl: './header-mobile.component.html',
  styleUrl: './header-mobile.component.css',
})
export class HeaderMobileComponent {
  showAccountModal = false;
  private destroyRef = inject(DestroyRef);
  readonly globalUserStateService = inject(GlobalUserStateService);
  readonly userRole = this.globalUserStateService.role;

  openAccountModal() {
    this.showAccountModal = true;
  }

  closeAccountModal() {
    this.showAccountModal = false;
  }

  @Input() menuOpen = false;
  @Output() close = new EventEmitter<void>();

  isRtl = false;
  disableTransition = false;

  constructor(readonly translateService: TranslateServiceService , @Inject(PLATFORM_ID) private platformId: Object) {
    this.isRtl = this.translateService.getCurrentDir() === 'rtl';

    this.translateService.dir$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((dir) => {
        this.disableTransition = true;
        this.isRtl = dir === 'rtl';

        if (isPlatformBrowser(this.platformId)) {
          requestAnimationFrame(() => {
            this.disableTransition = false;
          });
        }
      });
  }

  closeMenu() {
    this.close.emit();
  }
}
