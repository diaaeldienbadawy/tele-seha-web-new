import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingPageHeroSectionComponent } from './landing-page-hero-section.component';

describe('LandingPageHeroSectionComponent', () => {
  let component: LandingPageHeroSectionComponent;
  let fixture: ComponentFixture<LandingPageHeroSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPageHeroSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingPageHeroSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
