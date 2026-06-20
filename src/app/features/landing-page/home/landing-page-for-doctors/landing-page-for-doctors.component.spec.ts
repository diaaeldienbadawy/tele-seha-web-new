import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingPageForDoctorsComponent } from './landing-page-for-doctors.component';

describe('LandingPageForDoctorsComponent', () => {
  let component: LandingPageForDoctorsComponent;
  let fixture: ComponentFixture<LandingPageForDoctorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPageForDoctorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingPageForDoctorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
