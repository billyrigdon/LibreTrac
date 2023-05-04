import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { toggleLoading } from 'src/app/store/shared/actions/shared.actions';
import { getAuthState } from 'src/app/store/shared/selectors/shared.selector';
let ExploreComponent = class ExploreComponent {
    constructor(storyService, voteService, store, router, storageService, route) {
        this.storyService = storyService;
        this.voteService = voteService;
        this.store = store;
        this.router = router;
        this.storageService = storageService;
        this.route = route;
        this.drugX = '';
        this.drugY = '';
        this.currentUrl = '';
        this.stories = Array();
        this.isLoggedIn = this.store.select(getAuthState);
        this.pageNumber = 0;
        this.currentUrl = location.toString();
    }
    setStoriesOnScroll(res) {
        const newStories = JSON.parse(res);
        if (newStories) {
            this.stories.push(...newStories);
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
    }
    onScroll() {
        if (this.drugX && this.drugY) {
            this.storyService.getFilteredStories(++this.pageNumber * 10, this.drugX, this.drugY).subscribe((res) => {
                this.setStoriesOnScroll(res);
            });
        }
        if (!this.drugX && !this.drugY) {
            this.storyService.getAllStories(++this.pageNumber * 10).subscribe((res) => {
                this.setStoriesOnScroll(res);
            });
        }
    }
    setStoriesInit(res) {
        const jsonStories = JSON.parse(res);
        this.stories = jsonStories ? jsonStories : [];
        for (let i = 0; i < this.stories.length; i++) {
            const storyDate = new Date(this.stories[i].date);
            const formattedDate = storyDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
            this.stories[i].date = formattedDate;
        }
    }
    ngOnInit() {
        this.store.dispatch(toggleLoading({ status: true }));
        this.isLoggedIn.subscribe((loggedIn) => {
            if (!loggedIn) {
                this.router.navigateByUrl('/login');
            }
        });
        this.route.queryParams.subscribe((params) => {
            this.drugX = params['drugX'];
            this.drugY = params['drugY'];
            console.log(params);
            if (this.drugX || this.drugY) {
                this.storyService.getFilteredStories(this.pageNumber, this.drugX, this.drugY).subscribe((res) => {
                    this.setStoriesInit(res);
                    this.store.dispatch(toggleLoading({ status: false }));
                }, (err) => {
                    this.store.dispatch(toggleLoading({ status: false }));
                    // alert('No search results found');
                });
            }
        });
        if (!this.drugX && !this.drugY) {
            this.storyService.getAllStories(this.pageNumber).subscribe((res) => {
                this.setStoriesInit(res);
                this.store.dispatch(toggleLoading({ status: false }));
            }, (err) => {
                this.store.dispatch(toggleLoading({ status: false }));
                // alert('No search results found');
            });
        }
        // this.router.events.subscribe(event => {
        // 	console.log(event);
        // 	if (event instanceof NavigationStart) {
        // 		if (event.url.toString().includes(this.currentUrl) && this.currentUrl.length < event.url.toString().length) 
        // 		if (this.currentUrl.length < event.url.toString().length) {
        // 			window.location.reload();
        // 		}
        // 	}
        // });
        // this.router.events.pipe(
        // 	filter((event): event is NavigationStart => event instanceof NavigationStart)
        // ).subscribe((event: NavigationStart) => {
        // 	const urlTree = this.router.parseUrl(event.url)
        // 	const queryParams = urlTree.queryParams;
        // 	const queryKeys = Object.keys(queryParams);
        // 	// if (queryKeys.length > 0) {
        // 	// 	window.location.reload();
        // 	// }
        // })
    }
};
ExploreComponent = __decorate([
    Component({
        selector: 'app-explore',
        templateUrl: './explore.component.html',
        styleUrls: ['./explore.component.scss'],
    })
], ExploreComponent);
export { ExploreComponent };
//# sourceMappingURL=explore.component.js.map