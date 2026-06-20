import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorPrivacyPolicyComponent } from './doctor-privacy-policy.component';

describe('DoctorPrivacyPolicyComponent', () => {
  let component: DoctorPrivacyPolicyComponent;
  let fixture: ComponentFixture<DoctorPrivacyPolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorPrivacyPolicyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorPrivacyPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
