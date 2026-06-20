import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingPageGetStartedComponent } from './landing-page-get-started.component';

describe('LandingPageGetStartedComponent', () => {
  let component: LandingPageGetStartedComponent;
  let fixture: ComponentFixture<LandingPageGetStartedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPageGetStartedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingPageGetStartedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
