import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { setNotifications } from './store/comments/comments.actions';
import { getAddCommentsOpen } from './store/comments/comments.selector';
import { setUserId, toggleAuth } from './store/shared/actions/shared.actions';
import { getAuthState, getLoading, } from './store/shared/selectors/shared.selector';
let AppComponent = class AppComponent {
    constructor(storageService, store, router, notificationService, authService) {
        this.storageService = storageService;
        this.store = store;
        this.router = router;
        this.notificationService = notificationService;
        this.authService = authService;
        this.title = 'shulgin';
        this.isLoading = this.store.select(getLoading);
        this.isLoggedIn = this.store.select(getAuthState);
        this.addCommentOpen = this.store.select(getAddCommentsOpen);
        this.userId = 0;
        this.loggedIn = false;
    }
    ngAfterViewInit() {
        if (localStorage.getItem('user')) {
            //Get userId from user stored in local storage
            this.userId = JSON.parse(localStorage.getItem('user') || '').userId;
            //Set global userId
            this.store.dispatch(setUserId({ userId: this.userId }));
            this.notificationService
                .getUserNotifications(this.userId)
                .subscribe((noties) => {
                this.store.dispatch(setNotifications({ notifications: noties }));
            });
        }
        this.isLoggedIn.subscribe((res) => {
            this.loggedIn = res;
        });
    }
    ngOnInit() {
        //Scroll to top of page on route changes aside from explore page
        this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe(() => {
            if (!this.router.url.includes('explore')) {
                document.body.scrollTop = 0;
            }
        });
        if (this.storageService.getToken()) {
            if (this.authService.tokenExpired(this.storageService.getToken())) {
                this.storageService.signout();
            }
            else {
                this.store.dispatch(toggleAuth({ status: true }));
            }
        }
        if (localStorage.getItem('user')) {
            //Get userId from user stored in local storage
            this.userId = JSON.parse(localStorage.getItem('user') || '').userId;
            //Set global userId
            this.store.dispatch(setUserId({ userId: this.userId }));
            this.notificationService
                .getUserNotifications(this.userId)
                .subscribe((noties) => {
                this.store.dispatch(setNotifications({ notifications: noties }));
            });
        }
        this.isLoading = this.store.select(getLoading);
    }
};
AppComponent = __decorate([
    Component({
        selector: 'app-root',
        templateUrl: './app.component.html',
        styleUrls: ['./app.component.scss'],
    })
], AppComponent);
export { AppComponent };
//# sourceMappingURL=app.component.js.map