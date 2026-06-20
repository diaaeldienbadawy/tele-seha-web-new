import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorPrivacyPolicyPageComponent } from './doctor-privacy-policy-page.component';

describe('DoctorPrivacyPolicyPageComponent', () => {
  let component: DoctorPrivacyPolicyPageComponent;
  let fixture: ComponentFixture<DoctorPrivacyPolicyPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorPrivacyPolicyPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorPrivacyPolicyPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
