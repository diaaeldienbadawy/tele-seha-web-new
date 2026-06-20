import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorAlldoctorsSectionComponent } from './doctor-alldoctors-section.component';

describe('DoctorAlldoctorsSectionComponent', () => {
  let component: DoctorAlldoctorsSectionComponent;
  let fixture: ComponentFixture<DoctorAlldoctorsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorAlldoctorsSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorAlldoctorsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
