import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomSheetInfoComponent } from './bottom-sheet-info.component';

describe('BottomSheetInfoComponent', () => {
  let component: BottomSheetInfoComponent;
  let fixture: ComponentFixture<BottomSheetInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BottomSheetInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BottomSheetInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
