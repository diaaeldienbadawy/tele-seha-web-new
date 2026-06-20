import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutUsHeroSectionComponent } from './about-us-hero-section.component';

describe('AboutUsHeroSectionComponent', () => {
  let component: AboutUsHeroSectionComponent;
  let fixture: ComponentFixture<AboutUsHeroSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutUsHeroSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AboutUsHeroSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
