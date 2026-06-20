import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientWatingSessionPageComponent } from './patient-wating-session-page.component';

describe('PatientWatingSessionPageComponent', () => {
  let component: PatientWatingSessionPageComponent;
  let fixture: ComponentFixture<PatientWatingSessionPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientWatingSessionPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientWatingSessionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
