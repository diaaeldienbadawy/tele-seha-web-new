import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditLabtestComponent } from './add-edit-labtest.component';

describe('AddEditLabtestComponent', () => {
  let component: AddEditLabtestComponent;
  let fixture: ComponentFixture<AddEditLabtestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditLabtestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditLabtestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
