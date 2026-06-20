import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientHomePageComponent } from './patient-home-page.component';

describe('PatientHomePageComponent', () => {
  let component: PatientHomePageComponent;
  let fixture: ComponentFixture<PatientHomePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientHomePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientHomePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
