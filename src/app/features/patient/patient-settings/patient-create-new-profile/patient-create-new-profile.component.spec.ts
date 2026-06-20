import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientCreateNewProfileComponent } from './patient-create-new-profile.component';

describe('PatientCreateNewProfileComponent', () => {
  let component: PatientCreateNewProfileComponent;
  let fixture: ComponentFixture<PatientCreateNewProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientCreateNewProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientCreateNewProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
