import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchForDoctorAllDoctorComponent } from './search-for-doctor-all-doctor.component';

describe('SearchForDoctorAllDoctorComponent', () => {
  let component: SearchForDoctorAllDoctorComponent;
  let fixture: ComponentFixture<SearchForDoctorAllDoctorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchForDoctorAllDoctorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchForDoctorAllDoctorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
