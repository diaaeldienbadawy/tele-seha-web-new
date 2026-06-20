import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorTermsAndConditionsPageComponent } from './doctor-terms-and-conditions-page.component';

describe('DoctorTermsAndConditionsPageComponent', () => {
  let component: DoctorTermsAndConditionsPageComponent;
  let fixture: ComponentFixture<DoctorTermsAndConditionsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorTermsAndConditionsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorTermsAndConditionsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
