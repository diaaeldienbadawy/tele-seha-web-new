import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportHeroSectionComponent } from './support-hero-section.component';

describe('SupportHeroSectionComponent', () => {
  let component: SupportHeroSectionComponent;
  let fixture: ComponentFixture<SupportHeroSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupportHeroSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupportHeroSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
