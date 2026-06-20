import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialtyInfoComponent } from './specialty-info.component';

describe('SpecialtyInfoComponent', () => {
  let component: SpecialtyInfoComponent;
  let fixture: ComponentFixture<SpecialtyInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecialtyInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpecialtyInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
