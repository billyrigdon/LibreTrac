import { TestBed } from '@angular/core/testing';
import { CommentThreadComponent } from './comment-thread.component';
describe('CommentThreadComponent', () => {
    let component;
    let fixture;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CommentThreadComponent]
        })
            .compileComponents();
    });
    beforeEach(() => {
        fixture = TestBed.createComponent(CommentThreadComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
//# sourceMappingURL=comment-thread.component.spec.js.map