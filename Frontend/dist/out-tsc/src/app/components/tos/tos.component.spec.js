import { TestBed } from '@angular/core/testing';
import { TosComponent } from './tos.component';
describe('TosComponent', () => {
    let component;
    let fixture;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TosComponent]
        })
            .compileComponents();
        fixture = TestBed.createComponent(TosComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
//# sourceMappingURL=tos.component.spec.js.map