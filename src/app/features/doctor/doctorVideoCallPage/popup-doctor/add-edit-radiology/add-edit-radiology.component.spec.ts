import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditRadiologyComponent } from './add-edit-radiology.component';

describe('AddEditRadiologyComponent', () => {
  let component: AddEditRadiologyComponent;
  let fixture: ComponentFixture<AddEditRadiologyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditRadiologyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditRadiologyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
