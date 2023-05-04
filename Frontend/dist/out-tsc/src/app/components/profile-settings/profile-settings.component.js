import { __decorate } from "tslib";
import { Component, Input } from '@angular/core';
import { Validators } from '@angular/forms';
import { ModalComponent } from '../modal/modal.component';
// @Component({
// 	selector: 'app-bottom-sheet',
// 	template: `
//     <div class="bottom-sheet-container">
//         <input  (ngModelChange)="filterOptions()" placeholder="Medication" [(ngModel)]="filterTextDrug">
//       <mat-list>
//         <mat-list-item (click)="addDrug(option.drugId)" *ngFor="let option of filteredDrugs">
//           {{ option.name }}
//         </mat-list-item>
//       </mat-list>
//     </div>
//   `,
// 	styles: [`
// 	mat-list-item {
// 		cursor: pointer !important;
// 	}
//     .bottom-sheet-container {
//       height: 50vh;
//       width: 100%;
//       padding: 16px;
//       box-sizing: border-box;
// 	  /* margin: 24px; */
// 	  input {
// 		margin-top: 8px;
// 		margin-left: 5%;
// 		width: 90% !important;
// 		padding: 12px !important;
// 	  }
// 	}
//   `]
// })
// export class BottomSheetSearchComponent implements OnInit {
// 	drugs: Array<Drug> = [];
// 	// Add problem type
// 	@Input() problems?: Array<any>
// 	filteredDrugs = this.drugs.slice();
// 	filterTextDrug = '';
// 	dosage = '';
// 	constructor(private router: Router, private drugService: DrugService, private bottomSheetRef: MatBottomSheetRef<BottomSheetDrugComponent>) { }
// 	addDrug(drugId: number) {
// 		// if (!this.dosage) {
// 		// 	return;
// 		// }
// 	}
// 	ngOnInit() {
// 		this.drugService.getDrugs().subscribe((res) => {
// 			this.drugs = JSON.parse(res);
// 			this.filteredDrugs = this.drugs.slice();
// 		});
// 	}
// 	filterOptions() {
// 		this.filteredDrugs = this.drugs.filter(option =>
// 			option.name.toLowerCase().includes(this.filterTextDrug.toLowerCase())
// 		);
// 	}
// 	resetFilter() {
// 		this.filteredDrugs = this.drugs.slice();
// 		this.filterTextDrug = '';
// 	}
// }
let BottomSheetInfoComponent = class BottomSheetInfoComponent {
    constructor(router, drugService, bottomSheetRef, disorderService, dialog) {
        this.router = router;
        this.drugService = drugService;
        this.bottomSheetRef = bottomSheetRef;
        this.disorderService = disorderService;
        this.dialog = dialog;
        this.summary = '';
        this.id = 0;
        this.isDrug = false;
    }
    confirmDelete() {
        const dialogRef = this.dialog.open(ModalComponent, {
            width: '90%',
            height: '50%',
        });
        dialogRef.componentInstance.confirmMessage = 'DELETE';
        dialogRef.componentInstance.buttonText = "CANCEL";
        dialogRef.componentInstance.message = 'Are you sure you want to delete?';
        dialogRef.componentInstance.onClose.subscribe((event) => {
            dialogRef.close();
        });
        dialogRef.componentInstance.onConfirm.subscribe((event) => {
            this.onRemove();
        });
    }
    onRemove() {
        if (this.isDrug) {
            this.drugService.removeUserDrug(this.id).subscribe((res) => window.location.reload(), (err) => { this.summary = 'Failed to delete'; });
        }
        else {
            this.disorderService.removeUserDisorder(this.id).subscribe((res) => window.location.reload(), (err) => { this.summary = 'Failed to delete'; });
        }
    }
    ngOnInit() {
    }
};
BottomSheetInfoComponent = __decorate([
    Component({
        selector: 'app-bottom-sheet',
        template: `
    <div class="bottom-sheet-container">
       <p>{{summary}}</p>
    </div>
	<span (click)="this.confirmDelete()" [style]="{color: '#b39cd0'}" role="button" class='material-icons'>delete</span>
  `,
        styles: [`
	
	mat-list-item {
		cursor: pointer !important;
	}

    .bottom-sheet-container {
      height: 50vh;
      width: 100%;
      padding: 16px;
      box-sizing: border-box;
	  overflow: hidden;
	  /* margin: 24px; */
	  p {
		/* overflow-y: scroll !important; */
		margin-top: 8px;
		margin-left: 5%;
		width: 90% !important;
		padding: 12px !important;
		height: 100%;
	  }
	  span {
		position: sticky !important;
	  }
	}
  `]
    })
], BottomSheetInfoComponent);
export { BottomSheetInfoComponent };
let BottomSheetDrugComponent = class BottomSheetDrugComponent {
    constructor(router, drugService, bottomSheetRef) {
        this.router = router;
        this.drugService = drugService;
        this.bottomSheetRef = bottomSheetRef;
        this.drugs = [];
        this.filteredDrugs = this.drugs.slice();
        this.filterTextDrug = '';
        this.dosage = '';
    }
    addDrug(drugId) {
        // if (!this.dosage) {
        // 	return;
        // }
        if (localStorage.getItem('userProfile')) {
            let user = JSON.parse(localStorage.getItem('userProfile') || '');
            const userId = user.userId;
            // const val = this.dosage.value;
            this.drugService
                .addUserDrug(userId, drugId, this.dosage)
                .subscribe((res) => {
                // this.router.navigateByUrl('/profile');
                window.location.reload();
            }, (err) => {
                alert('Failed to add medication. Is this a duplicate?');
            });
        }
    }
    ngOnInit() {
        this.drugService.getDrugs().subscribe((res) => {
            this.drugs = JSON.parse(res);
            this.filteredDrugs = this.drugs.slice();
        });
    }
    filterOptions() {
        this.filteredDrugs = this.drugs.filter(option => option.name.toLowerCase().includes(this.filterTextDrug.toLowerCase()));
    }
    resetFilter() {
        this.filteredDrugs = this.drugs.slice();
        this.filterTextDrug = '';
    }
};
__decorate([
    Input()
], BottomSheetDrugComponent.prototype, "problems", void 0);
BottomSheetDrugComponent = __decorate([
    Component({
        selector: 'app-bottom-sheet',
        template: `
    <div class="bottom-sheet-container">
        <input  (ngModelChange)="filterOptions()" placeholder="Medication" [(ngModel)]="filterTextDrug">
		<input placeholder="Dosage" name="dosage" [(ngModel)]="dosage" type="text" />
      <mat-list>
        <mat-list-item (click)="addDrug(option.drugId)" *ngFor="let option of filteredDrugs">
          {{ option.name }}
        </mat-list-item>
      </mat-list>
    </div>
  `,
        styles: [`
	
	mat-list-item {
		cursor: pointer !important;
	}

    .bottom-sheet-container {
      height: 50vh;
      width: 100%;
      padding: 16px;
      box-sizing: border-box;
	  /* margin: 24px; */
	  input {
		margin-top: 8px;
		margin-left: 5%;
		width: 90% !important;
		padding: 12px !important;
	  }
	}
  `]
    })
], BottomSheetDrugComponent);
export { BottomSheetDrugComponent };
let BottomSheetDisorderComponent = class BottomSheetDisorderComponent {
    constructor(router, disorderService, bottomSheetRef) {
        this.router = router;
        this.disorderService = disorderService;
        this.bottomSheetRef = bottomSheetRef;
        this.disorders = [];
        // Add problem type
        // @Input() problems?: Array<any>
        this.filteredDisorders = this.disorders.slice();
        this.filterTextDisorder = '';
    }
    addDisorder(disorderId) {
        if (localStorage.getItem('userProfile')) {
            let user = JSON.parse(localStorage.getItem('userProfile') || '');
            const userId = user.userId;
            this.disorderService
                .addUserDisorder(userId, disorderId)
                .subscribe((res) => {
                // console.log(res);
                // this.router.navigateByUrl('/profile');
                window.location.reload();
            }, (err) => {
                alert('Failed to add disorder. Is this a duplicate?');
            });
        }
    }
    ngOnInit() {
        this.disorderService.getDisorders().subscribe((res) => {
            this.disorders = JSON.parse(res);
            this.filteredDisorders = this.disorders.slice();
        });
    }
    filterOptions() {
        this.filteredDisorders = this.disorders.filter(option => option.disorderName.toLowerCase().includes(this.filterTextDisorder.toLowerCase()));
    }
    resetFilter() {
        this.filteredDisorders = this.disorders.slice();
        this.filterTextDisorder = '';
    }
};
BottomSheetDisorderComponent = __decorate([
    Component({
        selector: 'app-bottom-sheet',
        template: `
    <div class="bottom-sheet-container">
        <input (ngModelChange)="filterOptions()" placeholder="Disorders" [(ngModel)]="filterTextDisorder">
      <mat-list>
        <mat-list-item (click)="addDisorder(option.disorderId)"  *ngFor="let option of filteredDisorders">
          {{ option.disorderName }}
        </mat-list-item>
      </mat-list>
    </div>
  `,
        styles: [`
	
	mat-list-item {
		cursor: pointer !important;
	}

    .bottom-sheet-container {
      height: 50vh;
      width: 100%;
      padding: 16px;
      box-sizing: border-box;
	  /* margin: 24px; */
	  input {
		margin-top: 8px;
		margin-left: 5%;
		width: 90% !important;
		padding: 12px !important;
	  }
	}

	

  `]
    })
], BottomSheetDisorderComponent);
export { BottomSheetDisorderComponent };
let ProfileSettingsComponent = class ProfileSettingsComponent {
    constructor(formBuilder, profileService, router, storageService, store, drugService, bottomSheet) {
        this.formBuilder = formBuilder;
        this.profileService = profileService;
        this.router = router;
        this.storageService = storageService;
        this.store = store;
        this.drugService = drugService;
        this.bottomSheet = bottomSheet;
        this.form = this.formBuilder.group({
            covidVaccine: [false, Validators.required],
            smoker: [false, Validators.required],
            drinker: [false, Validators.required],
            optOut: [false, Validators.required],
        });
        this.userProfile = {
            userId: 0,
            username: '',
            reputation: 0,
            covidVaccine: false,
            smoker: false,
            drinker: false,
            // twoFactor: false,
            optOutOfPublicStories: false,
            notificationPermission: false,
            textSize: 16
        };
        this.drugs = [];
        this.drugForm = this.formBuilder.group({
            drugId: [0],
            dosage: ['', Validators.required],
        });
    }
    ngOnInit() {
        this.drugService.getDrugs().subscribe((res) => {
            this.drugs = JSON.parse(res);
        });
        if (localStorage.getItem('userProfile')) {
            this.userProfile = JSON.parse(localStorage.getItem('userProfile') || '');
            this.form = this.formBuilder.group({
                covidVaccine: [this.userProfile.covidVaccine, Validators.required],
                smoker: [this.userProfile.smoker, Validators.required],
                drinker: [this.userProfile.drinker, Validators.required],
                optOut: [this.userProfile.optOutOfPublicStories, Validators.required],
            });
        }
    }
    openBottomSheet() {
        const bottomSheetRef = this.bottomSheet.open(BottomSheetDrugComponent);
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
                this.router.navigateByUrl('/profileSettings');
                window.location.reload();
            });
        }
    }
    // goToDrugs() {
    // 	this.router.navigateByUrl('addDrug');
    // }
    updateProfile() {
        let val = this.form.value;
        this.userProfile.covidVaccine = val.covidVaccine;
        this.userProfile.smoker = val.smoker;
        this.userProfile.drinker = val.drinker;
        this.userProfile.optOutOfPublicStories = val.optOut;
        this.profileService.updateProfile(this.userProfile).subscribe((res) => {
            this.profileService.setProfile(res);
            this.router.navigate(['/profile']);
        });
    }
};
ProfileSettingsComponent = __decorate([
    Component({
        selector: 'app-profile-settings',
        templateUrl: './profile-settings.component.html',
        styleUrls: ['./profile-settings.component.scss']
    })
], ProfileSettingsComponent);
export { ProfileSettingsComponent };
//# sourceMappingURL=profile-settings.component.js.map