import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorDetailsSectionComponent } from './doctor-details-section.component';

describe('DoctorDetailsSectionComponent', () => {
  let component: DoctorDetailsSectionComponent;
  let fixture: ComponentFixture<DoctorDetailsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorDetailsSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorDetailsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
