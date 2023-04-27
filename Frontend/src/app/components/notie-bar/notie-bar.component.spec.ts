import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotieBarComponent } from './notie-bar.component';

describe('NotieBarComponent', () => {
  let component: NotieBarComponent;
  let fixture: ComponentFixture<NotieBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotieBarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotieBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
