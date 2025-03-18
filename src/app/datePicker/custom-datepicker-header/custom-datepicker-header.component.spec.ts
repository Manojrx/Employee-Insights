import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomDatepickerHeaderComponent } from './custom-datepicker-header.component';

describe('CustomDatepickerHeaderComponent', () => {
  let component: CustomDatepickerHeaderComponent;
  let fixture: ComponentFixture<CustomDatepickerHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomDatepickerHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomDatepickerHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
