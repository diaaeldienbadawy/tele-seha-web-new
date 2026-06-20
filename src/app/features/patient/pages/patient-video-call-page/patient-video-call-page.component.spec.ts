import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientVideoCallPageComponent } from './patient-video-call-page.component';

describe('PatientVideoCallPageComponent', () => {
  let component: PatientVideoCallPageComponent;
  let fixture: ComponentFixture<PatientVideoCallPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientVideoCallPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientVideoCallPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
