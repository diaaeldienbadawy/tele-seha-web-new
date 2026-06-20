import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchForDoctorHeroSectionComponent } from './search-for-doctor-hero-section.component';

describe('SearchForDoctorHeroSectionComponent', () => {
  let component: SearchForDoctorHeroSectionComponent;
  let fixture: ComponentFixture<SearchForDoctorHeroSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchForDoctorHeroSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchForDoctorHeroSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
