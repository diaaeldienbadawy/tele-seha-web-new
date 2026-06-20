import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivacyHeroSectionComponent } from './privacy-hero-section.component';

describe('PrivacyHeroSectionComponent', () => {
  let component: PrivacyHeroSectionComponent;
  let fixture: ComponentFixture<PrivacyHeroSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacyHeroSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrivacyHeroSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
