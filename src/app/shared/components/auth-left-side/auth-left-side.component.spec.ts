import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthLeftSideComponent } from './auth-left-side.component';

describe('AuthLeftSideComponent', () => {
  let component: AuthLeftSideComponent;
  let fixture: ComponentFixture<AuthLeftSideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthLeftSideComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthLeftSideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
