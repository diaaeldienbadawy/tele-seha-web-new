import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermsAndCondititonHeroSectionComponent } from './terms-and-condititon-hero-section.component';

describe('TermsAndCondititonHeroSectionComponent', () => {
  let component: TermsAndCondititonHeroSectionComponent;
  let fixture: ComponentFixture<TermsAndCondititonHeroSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TermsAndCondititonHeroSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TermsAndCondititonHeroSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
