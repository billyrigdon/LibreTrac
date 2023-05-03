import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { setUserId, toggleAuth, toggleLoading, } from 'src/app/store/shared/actions/shared.actions';
let LoginComponent = class LoginComponent {
    constructor(formBuilder, authService, storageService, router, profileService, store) {
        this.formBuilder = formBuilder;
        this.authService = authService;
        this.storageService = storageService;
        this.router = router;
        this.profileService = profileService;
        this.store = store;
        this.form = this.formBuilder.group({
            email: ['', Validators.compose([Validators.required, Validators.email])],
            password: ['', Validators.compose([Validators.required])]
        });
    }
    //Make login post request, save token response to session storage, navigate to home
    login() {
        const val = this.form.value;
        if (val.email && val.password) {
            this.store.dispatch(toggleLoading({ status: true }));
            this.authService
                .login(val.email.toLowerCase(), val.password)
                .subscribe((res) => {
                this.storageService.saveUser(res.username);
                this.storageService.saveToken(res.token);
                this.profileService.getProfile().subscribe((res) => {
                    this.profileService.setProfile(res);
                    this.store.dispatch(toggleAuth({ status: true }));
                    this.store.dispatch(setUserId({
                        userId: JSON.parse(localStorage.getItem('userProfile') || '').userId,
                    }));
                    this.store.dispatch(toggleLoading({ status: false }));
                    this.router.navigateByUrl('/profile');
                });
            }, (err) => {
                this.store.dispatch(toggleLoading({ status: false }));
                const message = 'Username or password is incorrect';
                alert(message);
            });
        }
    }
    //If already logged in and user profile found, navigate to home
    ngOnInit() {
        // this.store.select(getAuthState).subscribe((res) => {
        // 	if (!res) {
        // 		this.router.navigateByUrl('/profile')
        // 	}
        // })
        if (this.storageService.getToken()) {
            this.router.navigateByUrl('/profile');
        }
    }
};
LoginComponent = __decorate([
    Component({
        selector: 'app-login',
        templateUrl: './login.component.html',
        styleUrls: ['./login.component.scss'],
    })
], LoginComponent);
export { LoginComponent };
//# sourceMappingURL=login.component.js.map