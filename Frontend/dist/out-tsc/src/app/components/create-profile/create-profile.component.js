import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
let CreateProfileComponent = class CreateProfileComponent {
    constructor(formBuilder, profileService, router, storageService, store, dialog) {
        this.formBuilder = formBuilder;
        this.profileService = profileService;
        this.router = router;
        this.storageService = storageService;
        this.store = store;
        this.dialog = dialog;
        this.form = this.formBuilder.group({
            age: ['', Validators.required],
            weight: ['', Validators.required],
            covidVaccine: [false, Validators.required],
            smoker: [false, Validators.required],
            drinker: [false, Validators.required],
            optOut: [false, Validators.required],
        });
        this.user = {
            userId: 0,
            username: '',
            reputation: 0,
            covidVaccine: false,
            smoker: false,
            drinker: false,
            // twoFactor: false,
            optOutOfPublicStories: false,
            notificationPermission: false,
            textSize: 16,
        };
    }
    //Redirect to splash screen if not logged in
    ngOnInit() {
        // if (!this.storageService.getToken()) {
        // 	this.router.navigateByUrl("/explore");
        // }
    }
};
CreateProfileComponent = __decorate([
    Component({
        selector: 'app-create-profile',
        templateUrl: './create-profile.component.html',
        styleUrls: ['./create-profile.component.scss'],
    })
], CreateProfileComponent);
export { CreateProfileComponent };
//# sourceMappingURL=create-profile.component.js.map