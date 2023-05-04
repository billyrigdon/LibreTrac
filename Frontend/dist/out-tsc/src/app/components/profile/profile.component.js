import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { toggleAuth, toggleLoading } from 'src/app/store/shared/actions/shared.actions';
import { WarningComponent } from '../warning/warning.component';
import { Validators } from '@angular/forms';
import { BottomSheetDisorderComponent, BottomSheetDrugComponent, BottomSheetInfoComponent } from '../profile-settings/profile-settings.component';
import axios from 'axios';
let ProfileComponent = class ProfileComponent {
    constructor(storyService, router, storageService, profileService, drugService, datepipe, store, dialog, formBuilder, bottomSheet, disorderService) {
        this.storyService = storyService;
        this.router = router;
        this.storageService = storageService;
        this.profileService = profileService;
        this.drugService = drugService;
        this.datepipe = datepipe;
        this.store = store;
        this.dialog = dialog;
        this.formBuilder = formBuilder;
        this.bottomSheet = bottomSheet;
        this.disorderService = disorderService;
        this.illnesses = [
            { name: 'Bipolar Disorder Type I' },
            { name: 'Attention Deficit Hyperactive Disorder - Combined' },
            { name: 'Insomnia Disorder' },
            { name: 'Generalized Anxiety Disorder' }
        ];
        this.stories = [];
        this.userDrugs = Array();
        this.userDisorders = Array();
        this.userProfile = {};
        this.profilePic = '../../../assets/Icons/avatar-placeholder.png';
        this.drugs = [];
        this.drugForm = this.formBuilder.group({
            drugId: [0],
            dosage: ['', Validators.required],
        });
    }
    openBottomSheetDrug() {
        const bottomSheetRef = this.bottomSheet.open(BottomSheetDrugComponent);
        bottomSheetRef.afterDismissed().subscribe(() => {
            console.log('Bottom sheet dismissed');
        });
    }
    openBottomSheetProblem() {
        const bottomSheetRef = this.bottomSheet.open(BottomSheetDisorderComponent);
        bottomSheetRef.afterDismissed().subscribe(() => {
            console.log('Bottom sheet dismissed');
        });
    }
    openBottomSheetInfo(summary, id, isDrug) {
        const bottomSheetRef = this.bottomSheet.open(BottomSheetInfoComponent);
        bottomSheetRef.instance.summary = summary;
        bottomSheetRef.instance.id = id;
        bottomSheetRef.instance.isDrug = isDrug;
        bottomSheetRef.afterDismissed().subscribe(() => {
            console.log('Bottom sheet dismissed');
        });
    }
    addDrug() {
        if (localStorage.getItem('userProfile')) {
            let user = JSON.parse(localStorage.getItem('userProfile') || '');
            const userId = user.userId;
            const val = this.drugForm.value;
            this.drugService
                .addUserDrug(userId, parseInt(val.drugId), val.dosage)
                .subscribe((res) => {
                // this.router.navigateByUrl('/profile');
                window.location.reload();
            });
        }
    }
    addDisorder() {
        if (localStorage.getItem('userProfile')) {
            let user = JSON.parse(localStorage.getItem('userProfile') || '');
            const userId = user.userId;
            const val = this.drugForm.value;
            this.disorderService
                .addUserDisorder(userId, parseInt(val.disorderId))
                .subscribe((res) => {
                // this.router.navigateByUrl('/profile');
                window.location.reload();
            });
        }
    }
    async getSummary(name, id, isDrug) {
        const apiEndpoint = "https://en.wikipedia.org/api/rest_v1/page/summary/";
        const encodedTitle = encodeURI(name);
        const url = `${apiEndpoint}${encodedTitle}`;
        try {
            const response = await axios.get(url);
            const summary = response.data.extract;
            this.openBottomSheetInfo(summary, id, isDrug);
            return { contents: summary };
        }
        catch (error) {
            this.openBottomSheetInfo('No information found', id, isDrug);
            return null;
        }
    }
    removeUserDrug(drugId) {
        const dialogRef = this.dialog.open(WarningComponent, {
            width: '500px',
            height: '500px',
        });
        dialogRef.componentInstance.message = 'Are you sure you want to remove this drug?';
        dialogRef.componentInstance.onCancel.subscribe((event) => {
            dialogRef.close();
            this.router.navigateByUrl('/profile');
        });
        dialogRef.componentInstance.onConfirm.subscribe(() => {
            this.drugService.removeUserDrug(drugId).subscribe((res) => {
                window.location.reload();
            });
        });
    }
    searchForDrug(drugId) {
        this.router.navigateByUrl('/explore?drugX=' + drugId + '&drugY=');
    }
    goToAddStory() {
        this.router.navigateByUrl('addStory');
    }
    goToSettings() {
        console.log('test');
        this.router.navigateByUrl('/profileSettings');
    }
    goToDrugs() {
        this.router.navigateByUrl('addDrug');
    }
    goToDrugInfo(drugName) {
        this.router.navigateByUrl('/drugInfo?drugName=' + drugName);
    }
    ngOnInit() {
        //Check if logged in and navigate to splash if not
        if (this.storageService.getToken() && this.storageService.getUser()) {
            //TODO: Move userprofile to shared state instead of handling it this way
            if (localStorage.getItem('userProfile')) {
                this.store.dispatch(toggleLoading({ status: true }));
                this.profileService.getProfile().subscribe((res) => {
                    this.profileService.setProfile(res);
                });
                //Get user fields from user stored in local storage
                this.userProfile = JSON.parse(localStorage.getItem('userProfile') || '');
                // Get drugs for add-drug bottom sheet
                this.drugService.getDrugs().subscribe((res) => {
                    this.drugs = JSON.parse(res);
                });
                //Get list of drugs that user is taking
                this.drugService.getUserDrugs().subscribe((res) => {
                    this.userDrugs = JSON.parse(res);
                }, (err) => {
                    console.log(err);
                    this.userDrugs = [];
                });
                this.disorderService.getUserDisorders().subscribe((res) => {
                    this.userDisorders = JSON.parse(res);
                    this.store.dispatch(toggleLoading({ status: false }));
                }, (err) => {
                    console.log(err);
                    this.userDisorders = [];
                    this.store.dispatch(toggleLoading({ status: false }));
                });
                //Get Profile if it does not exist in local storage
            }
            else {
                this.profileService.getProfile().subscribe((res) => {
                    this.profileService.setProfile(res);
                    //If user profile successfully saved, reload page
                    if (localStorage.getItem('userProfile')) {
                        window.location.reload();
                        //If couldn't get user profile, navigate to createProfile page
                    }
                    else {
                        this.router.navigateByUrl('/createProfile');
                    }
                });
            }
        }
        else {
            this.storageService.signout();
            this.store.dispatch(toggleAuth({ status: false }));
            this.router.navigateByUrl('/login');
        }
    }
};
ProfileComponent = __decorate([
    Component({
        selector: 'app-profile',
        templateUrl: './profile.component.html',
        styleUrls: ['./profile.component.scss'],
    })
], ProfileComponent);
export { ProfileComponent };
//# sourceMappingURL=profile.component.js.map