import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingPageSimpleStepsComponent } from './landing-page-simple-steps.component';

describe('LandingPageSimpleStepsComponent', () => {
  let component: LandingPageSimpleStepsComponent;
  let fixture: ComponentFixture<LandingPageSimpleStepsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPageSimpleStepsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingPageSimpleStepsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
