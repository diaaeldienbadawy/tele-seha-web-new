import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingPageComprehensiveCareComponent } from './landing-page-comprehensive-care.component';

describe('LandingPageComprehensiveCareComponent', () => {
  let component: LandingPageComprehensiveCareComponent;
  let fixture: ComponentFixture<LandingPageComprehensiveCareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPageComprehensiveCareComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingPageComprehensiveCareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
