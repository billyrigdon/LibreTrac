import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { toggleLoading } from 'src/app/store/shared/actions/shared.actions';
let UserStoriesComponent = class UserStoriesComponent {
    constructor(storyService, storageService, router, store) {
        this.storyService = storyService;
        this.storageService = storageService;
        this.router = router;
        this.store = store;
        this.stories = [];
    }
    ngOnInit() {
        this.store.dispatch(toggleLoading({ status: true }));
        if (this.storageService.getToken() && this.storageService.getUser()) {
            if (localStorage.getItem('userProfile')) {
                //Get user fields from user stored in local storage
                let user = JSON.parse(localStorage.getItem('userProfile') || '');
                const userId = user.userId;
                this.storyService
                    .getUserStories(userId)
                    .subscribe((res) => {
                    this.stories = JSON.parse(res);
                    if (!this.stories) {
                        this.stories = [];
                    }
                    for (let i = 0; i < this.stories.length; i++) {
                        const storyDate = new Date(this.stories[i].date);
                        const formattedDate = storyDate.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                        });
                        this.stories[i].date = formattedDate;
                    }
                    this.store.dispatch(toggleLoading({ status: false }));
                }, (err) => {
                    this.store.dispatch(toggleLoading({ status: false }));
                });
            }
            else {
                this.router.navigateByUrl('/login');
            }
        }
    }
};
UserStoriesComponent = __decorate([
    Component({
        selector: 'app-user-stories',
        templateUrl: './user-stories.component.html',
        styleUrls: ['./user-stories.component.scss']
    })
], UserStoriesComponent);
export { UserStoriesComponent };
//Get stories using userId from local storage
//# sourceMappingURL=user-stories.component.js.map