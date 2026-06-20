import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { HeaderNotificationComponent } from './header-notification.component';
import { NotificationService } from '../../../features/patient/service/notification.service';
import { LocalstorageService } from '../../../core/services/localstorage.service';

describe('HeaderNotificationComponent', () => {
  let component: HeaderNotificationComponent;
  let fixture: ComponentFixture<HeaderNotificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderNotificationComponent],
      providers: [
        {
          provide: NotificationService,
          useValue: {
            notifications$: new BehaviorSubject([]),
            isNoReadNotif: signal(false),
            markAllRead: jasmine.createSpy('markAllRead'),
          },
        },
        {
          provide: LocalstorageService,
          useValue: {
            get: () => '',
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
