import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomSheetDisorderComponent } from './bottom-sheet-disorder.component';

describe('BottomSheetDisorderComponent', () => {
  let component: BottomSheetDisorderComponent;
  let fixture: ComponentFixture<BottomSheetDisorderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BottomSheetDisorderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BottomSheetDisorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
