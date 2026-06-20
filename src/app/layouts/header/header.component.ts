import { Component, ElementRef, HostListener, ViewChild, DestroyRef, inject } from '@angular/core';
import { HeaderLogoComponent } from './header-logo/header-logo.component';
import { DesktopNavComponent } from './desktop-nav/desktop-nav.component';
import { HeaderNotificationComponent } from './header-notification/header-notification.component';
import { HeaderLanguageComponent } from './header-language/header-language.component';
import { HeaderprofileComponent } from './headerprofile/headerprofile.component';
import { HeaderMobileComponent } from './header-mobile/header-mobile.component';
import { TranslateServiceService } from '../../core/services/translate-service.service';
import { GlobalUserStateService } from '../../core/services/state/global-user-state.service';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    HeaderLogoComponent,
    DesktopNavComponent,
    HeaderNotificationComponent,
    HeaderLanguageComponent,
    HeaderprofileComponent,
    HeaderMobileComponent,
    TranslateModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  menuOpen = false;
  dropdownOpen = false;

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

  constructor(readonly translateService: TranslateServiceService) {
    this.translateService.lang$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.menuOpen = false;
        this.dropdownOpen = false;
      });
  }

  openMenu() {
    this.menuOpen = true;
  }

  closeMenu() {
    this.menuOpen = false;
    this.dropdownOpen = false;
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  navigate() {
    this.closeMenu();
  }
}
