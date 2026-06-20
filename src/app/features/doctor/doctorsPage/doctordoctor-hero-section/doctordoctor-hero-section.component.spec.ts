import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctordoctorHeroSectionComponent } from './doctordoctor-hero-section.component';

describe('DoctordoctorHeroSectionComponent', () => {
  let component: DoctordoctorHeroSectionComponent;
  let fixture: ComponentFixture<DoctordoctorHeroSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctordoctorHeroSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctordoctorHeroSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
