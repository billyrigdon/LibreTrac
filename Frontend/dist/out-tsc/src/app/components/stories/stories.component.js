import { __decorate } from "tslib";
import { Component, Input, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
let StoriesComponent = class StoriesComponent {
    constructor(storyService, voteService, store, router, storageService) {
        this.storyService = storyService;
        this.voteService = voteService;
        this.store = store;
        this.router = router;
        this.storageService = storageService;
        this.onScroll = new EventEmitter();
        this.distance = 0.1;
        this.throttle = 0;
    }
    onPageScroll() {
        console.log("scrolled");
        this.onScroll.emit();
    }
    openStory(storyId) {
        // this.store.dispatch(setStoryId({ storyId: storyId }));
        this.router.navigateByUrl('/story?storyId=' + storyId.toString());
    }
    getDateString(date) {
        const localDateObj = new Date(date);
        const localTimezoneOffsetMs = localDateObj.getTimezoneOffset() * 60 * 1000;
        const utcTimestampMs = localDateObj.getTime() + localTimezoneOffsetMs;
        const utcDateObj = new Date(utcTimestampMs);
        const options = { timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric' };
        const utcDateString = localDateObj.toLocaleDateString('UTC');
        return utcDateString;
    }
    ngOnInit() {
    }
};
__decorate([
    Input()
], StoriesComponent.prototype, "stories", void 0);
__decorate([
    Output()
], StoriesComponent.prototype, "onScroll", void 0);
StoriesComponent = __decorate([
    Component({
        selector: 'app-stories',
        templateUrl: './stories.component.html',
        styleUrls: ['./stories.component.scss'],
    })
], StoriesComponent);
export { StoriesComponent };
//# sourceMappingURL=stories.component.js.map