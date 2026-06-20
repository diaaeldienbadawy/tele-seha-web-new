import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingPageFullClinicComponent } from './landing-page-full-clinic.component';

describe('LandingPageFullClinicComponent', () => {
  let component: LandingPageFullClinicComponent;
  let fixture: ComponentFixture<LandingPageFullClinicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPageFullClinicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingPageFullClinicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
