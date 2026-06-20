import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientSupportComponent } from './patient-support.component';

describe('PatientSupportComponent', () => {
  let component: PatientSupportComponent;
  let fixture: ComponentFixture<PatientSupportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientSupportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientSupportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
