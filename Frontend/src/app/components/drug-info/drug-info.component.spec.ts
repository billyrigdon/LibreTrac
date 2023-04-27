import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrugInfoComponent } from './drug-info.component';

describe('DrugInfoComponent', () => {
  let component: DrugInfoComponent;
  let fixture: ComponentFixture<DrugInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DrugInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DrugInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
