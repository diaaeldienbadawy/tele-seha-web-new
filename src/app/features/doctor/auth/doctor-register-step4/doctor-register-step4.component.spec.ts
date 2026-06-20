import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorRegisterStep4Component } from './doctor-register-step4.component';

describe('DoctorRegisterStep4Component', () => {
  let component: DoctorRegisterStep4Component;
  let fixture: ComponentFixture<DoctorRegisterStep4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorRegisterStep4Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorRegisterStep4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
