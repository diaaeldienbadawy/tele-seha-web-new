import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorRegisterStep5Component } from './doctor-register-step5.component';

describe('DoctorRegisterStep5Component', () => {
  let component: DoctorRegisterStep5Component;
  let fixture: ComponentFixture<DoctorRegisterStep5Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorRegisterStep5Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorRegisterStep5Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
