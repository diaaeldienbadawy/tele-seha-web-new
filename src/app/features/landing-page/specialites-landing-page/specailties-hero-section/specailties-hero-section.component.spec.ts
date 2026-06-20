import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecailtiesHeroSectionComponent } from './specailties-hero-section.component';

describe('SpecailtiesHeroSectionComponent', () => {
  let component: SpecailtiesHeroSectionComponent;
  let fixture: ComponentFixture<SpecailtiesHeroSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecailtiesHeroSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpecailtiesHeroSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
