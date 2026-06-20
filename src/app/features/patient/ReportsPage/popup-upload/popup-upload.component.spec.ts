import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupUploadComponent } from './popup-upload.component';

describe('PopupUploadComponent', () => {
  let component: PopupUploadComponent;
  let fixture: ComponentFixture<PopupUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupUploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
