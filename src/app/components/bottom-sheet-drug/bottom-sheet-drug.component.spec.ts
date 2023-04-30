import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomSheetDrugComponent } from './bottom-sheet-drug.component';

describe('BottomSheetDrugComponent', () => {
  let component: BottomSheetDrugComponent;
  let fixture: ComponentFixture<BottomSheetDrugComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BottomSheetDrugComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BottomSheetDrugComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
