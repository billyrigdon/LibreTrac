import { TestBed } from '@angular/core/testing';
import { UserStoriesComponent } from './user-stories.component';
describe('UserStoriesComponent', () => {
    let component;
    let fixture;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [UserStoriesComponent]
        })
            .compileComponents();
        fixture = TestBed.createComponent(UserStoriesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
//# sourceMappingURL=user-stories.component.spec.js.map