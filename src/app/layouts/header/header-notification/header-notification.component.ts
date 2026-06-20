import { Component, HostListener, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LocalstorageService } from '../../../core/services/localstorage.service';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../features/patient/service/notification.service';
import type { TeleSehaNotificationListItem } from '../../../features/patient/models/notification.models';

@Component({
  selector: 'app-header-notification',
  imports: [CommonModule],
  templateUrl: './header-notification.component.html',
  styleUrl: './header-notification.component.css',
})
export class HeaderNotificationComponent implements OnInit {
  private localStorageService = inject(LocalstorageService);
  readonly notificationService = inject(NotificationService);

  isLoggedIn = false;
  role: string = '';

  showNotifications = false;

  notifications: TeleSehaNotificationListItem[] = [];

  constructor() {
    this.notificationService.notifications$
      .pipe(takeUntilDestroyed())
      .subscribe((list) => {
        this.notifications = list;
      });
  }

  ngOnInit(): void {
    const role = this.localStorageService.get('role');
    const accesstoken = this.localStorageService.get('accessToken');

    if (accesstoken && role === 'Patient') {
      this.role = role;
      this.isLoggedIn = true;
    }

    if (accesstoken && role === 'Doctor') {
      this.role = role;
      this.isLoggedIn = true;
    }
  }

  /** Stable @for track: live rows have _clientId; REST rows use composite key */
  trackKey(index: number, item: TeleSehaNotificationListItem): string {
    return item._clientId ?? `rest-${index}-${item.type}-${item.title}`;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.notificationService.markAllRead();
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-wrapper')) {
      this.showNotifications = false;
    }
  }
}
