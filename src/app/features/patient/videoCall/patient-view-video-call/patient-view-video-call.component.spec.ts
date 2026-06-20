import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientViewVideoCallComponent } from './patient-view-video-call.component';

describe('PatientViewVideoCallComponent', () => {
  let component: PatientViewVideoCallComponent;
  let fixture: ComponentFixture<PatientViewVideoCallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientViewVideoCallComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientViewVideoCallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
