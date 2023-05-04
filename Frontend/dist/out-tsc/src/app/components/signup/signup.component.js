import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { toggleAuth, toggleLoading } from 'src/app/store/shared/actions/shared.actions';
import { TosComponent } from '../tos/tos.component';
let SignupComponent = class SignupComponent {
    constructor(formBuilder, authService, router, storageService, store, dialog, profileService) {
        this.formBuilder = formBuilder;
        this.authService = authService;
        this.router = router;
        this.storageService = storageService;
        this.store = store;
        this.dialog = dialog;
        this.profileService = profileService;
        this.submitted = false;
        this.user = {
            userId: 0,
            username: '',
            reputation: 0,
            covidVaccine: false,
            smoker: false,
            drinker: false,
            optOutOfPublicStories: false,
            notificationPermission: false,
            textSize: 16,
        };
        this.form = this.formBuilder.group({
            agreement: [false, Validators.requiredTrue],
            username: ['', Validators.compose([Validators.required, Validators.minLength(4)])],
            email: ['', Validators.compose([Validators.required, Validators.email])],
            password: ['', Validators.compose([
                    Validators.required,
                    Validators.minLength(8),
                    Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[$@#!%*?&])[A-Za-z\\d$@#!%*?&]{8,}$')
                ])],
            confirmPassword: ['', Validators.compose([Validators.required])],
            covidVaccine: [false],
            smoker: [false],
            drinker: [false],
            optOut: [false],
        }, { validator: this.passwordMatchValidator });
    }
    ngOnInit() {
        if (this.storageService.getToken()) {
            this.router.navigateByUrl('/profile');
        }
    }
    passwordMatchValidator(form) {
        const password = form.get('password')?.value;
        const confirmPassword = form.get('confirmPassword')?.value;
        if (password !== confirmPassword) {
            form.get('confirmPassword')?.setErrors({ 'mismatch': true });
        }
        else {
            form.get('confirmPassword')?.setErrors(null);
        }
    }
    openTos() {
        const dialogRef = this.dialog.open(TosComponent, {
            data: {},
            width: '90%',
            height: '75%',
        });
        dialogRef.componentInstance.onClose.subscribe(() => {
            dialogRef.close();
        });
    }
    signup() {
        // this.termsNotAccepted = false;
        const val = this.form.value;
        this.submitted = true;
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        //Send post request, save token response to local storage, go to profile page
        if (val.agreement && val.confirmPassword && val.username && val.email && val.password) {
            this.store.dispatch(toggleLoading({ status: true }));
            this.authService
                .signup(val.username, val.email, val.password)
                .subscribe((res) => {
                this.storageService.saveToken(res.token);
                this.storageService.saveUser(res.username);
                this.user.username = res.username;
                this.user.covidVaccine = val.covidVaccine;
                this.user.smoker = val.smoker;
                this.user.drinker = val.drinker;
                this.user.optOutOfPublicStories = val.optOut;
                this.profileService.createProfile(this.user).subscribe((res) => {
                    this.profileService.setProfile(res);
                    this.store.dispatch(toggleAuth({ status: true }));
                    this.store.dispatch(toggleLoading({ status: false }));
                    this.router.navigateByUrl("/profile");
                }, (err) => {
                    const message = 'Failed to create save profile info.';
                    alert(message);
                    this.router.navigateByUrl('/profile');
                });
            }, (err) => {
                this.store.dispatch(toggleLoading({ status: false }));
                const message = 'Username already in use';
                alert(message);
            });
        }
    }
};
SignupComponent = __decorate([
    Component({
        selector: 'app-signup',
        templateUrl: './signup.component.html',
        styleUrls: ['./signup.component.scss'],
    })
], SignupComponent);
export { SignupComponent };
//# sourceMappingURL=signup.component.js.map