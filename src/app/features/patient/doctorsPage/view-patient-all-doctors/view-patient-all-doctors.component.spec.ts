import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPatientAllDoctorsComponent } from './view-patient-all-doctors.component';

describe('ViewPatientAllDoctorsComponent', () => {
  let component: ViewPatientAllDoctorsComponent;
  let fixture: ComponentFixture<ViewPatientAllDoctorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewPatientAllDoctorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewPatientAllDoctorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
