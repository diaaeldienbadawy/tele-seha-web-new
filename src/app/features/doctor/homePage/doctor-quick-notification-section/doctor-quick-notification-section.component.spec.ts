import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorQuickNotificationSectionComponent } from './doctor-quick-notification-section.component';

describe('DoctorQuickNotificationSectionComponent', () => {
  let component: DoctorQuickNotificationSectionComponent;
  let fixture: ComponentFixture<DoctorQuickNotificationSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorQuickNotificationSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorQuickNotificationSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
