import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorPrivacyAndSecurityComponent } from './doctor-privacy-and-security.component';

describe('DoctorPrivacyAndSecurityComponent', () => {
  let component: DoctorPrivacyAndSecurityComponent;
  let fixture: ComponentFixture<DoctorPrivacyAndSecurityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorPrivacyAndSecurityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorPrivacyAndSecurityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
