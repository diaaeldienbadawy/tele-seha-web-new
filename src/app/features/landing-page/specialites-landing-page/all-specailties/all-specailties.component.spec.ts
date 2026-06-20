import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllSpecailtiesComponent } from './all-specailties.component';

describe('AllSpecailtiesComponent', () => {
  let component: AllSpecailtiesComponent;
  let fixture: ComponentFixture<AllSpecailtiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllSpecailtiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllSpecailtiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
