import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ProfileService } from 'src/app/services/profile.service';
import { StorageService } from 'src/app/services/storage.service';
import { toggleAuth, toggleLoading } from 'src/app/store/shared/actions/shared.actions';
import { UserProfile } from 'src/app/types/user';
import { AppState } from 'src/app/store/app.state';
import { DrugService } from 'src/app/services/drug.service';
import { Drug } from 'src/app/types/drug';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Disorder } from 'src/app/types/disorder';
import { DisorderService } from 'src/app/services/disorder.service';
import { MatDialog } from '@angular/material/dialog';
import { ModalComponent } from '../modal/modal.component';
import { AuthService } from 'src/app/services/auth.service';





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








@Component({
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
	  overflow-y: auto;
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
export class BottomSheetInfoComponent implements OnInit {
	summary: string = ''
	id: number = 0;
	isDrug: boolean = false;

	constructor(private router: Router, private drugService: DrugService, private bottomSheetRef: MatBottomSheetRef<BottomSheetDrugComponent>, private disorderService: DisorderService, private dialog: MatDialog) { }

	confirmDelete() {
		const dialogRef = this.dialog.open(ModalComponent, {
			width: '90%',
			height: '50%',
		});

		dialogRef.componentInstance.confirmMessage = 'DELETE'
		dialogRef.componentInstance.buttonText = "CANCEL";
		dialogRef.componentInstance.message = 'Are you sure you want to delete?'

		dialogRef.componentInstance.onClose.subscribe((event: any) => {
			dialogRef.close();
		});

		dialogRef.componentInstance.onConfirm.subscribe((event: any) => {
			this.onRemove();
		});
	}

	onRemove() {
		if (this.isDrug) {
			this.drugService.removeUserDrug(this.id).subscribe((res) => window.location.reload(), (err) => { this.summary = 'Failed to delete' })
		} else {
			this.disorderService.removeUserDisorder(this.id).subscribe((res) => window.location.reload(), (err) => { this.summary = 'Failed to delete' })
		}
	}

	ngOnInit() {

	}

}



@Component({
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
export class BottomSheetDrugComponent implements OnInit {

	drugs: Array<Drug> = [];
	// Add problem type
	@Input() problems?: Array<any>

	filteredDrugs = this.drugs.slice();
	filterTextDrug = '';

	dosage = '';

	constructor(private router: Router, private drugService: DrugService, private bottomSheetRef: MatBottomSheetRef<BottomSheetDrugComponent>) { }

	addDrug(drugId: number) {
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
					alert('Failed to add medication. Is this a duplicate?')
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
		this.filteredDrugs = this.drugs.filter(option =>
			option.name.toLowerCase().includes(this.filterTextDrug.toLowerCase())
		);
	}

	resetFilter() {
		this.filteredDrugs = this.drugs.slice();
		this.filterTextDrug = '';
	}
}




@Component({
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
export class BottomSheetDisorderComponent implements OnInit {

	disorders: Array<Disorder> = [];
	// Add problem type
	// @Input() problems?: Array<any>

	filteredDisorders = this.disorders.slice();
	filterTextDisorder = '';



	constructor(private router: Router, private disorderService: DisorderService, private bottomSheetRef: MatBottomSheetRef<BottomSheetDrugComponent>) { }



	addDisorder(disorderId: number) {
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
					alert('Failed to add disorder. Is this a duplicate?')
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
		this.filteredDisorders = this.disorders.filter(option =>
			option.disorderName.toLowerCase().includes(this.filterTextDisorder.toLowerCase())
		);
	}

	resetFilter() {
		this.filteredDisorders = this.disorders.slice();
		this.filterTextDisorder = '';
	}
}








@Component({
	selector: 'app-profile-settings',
	templateUrl: './profile-settings.component.html',
	styleUrls: ['./profile-settings.component.scss']
})
export class ProfileSettingsComponent implements OnInit {
	form: UntypedFormGroup;
	userProfile: UserProfile;
	drugs: Array<Drug>;
	drugForm: UntypedFormGroup;
	resetPasswordForm: UntypedFormGroup;
	@ViewChild('formContainer') formContainer: ElementRef = new ElementRef(null);
	updateEmailForm: UntypedFormGroup;
	constructor(
		private formBuilder: UntypedFormBuilder,
		private profileService: ProfileService,
		private router: Router,
		private storageService: StorageService,
		private store: Store<AppState>,
		private drugService: DrugService,
		private bottomSheet: MatBottomSheet,
		private authService: AuthService,
	) {
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
		this.resetPasswordForm = this.formBuilder.group({
			oldPassword: ['', Validators.required],
			email: ['', Validators.compose([Validators.required, Validators.email])],
			password: ['', Validators.compose([
				Validators.required,
				Validators.minLength(8),
				Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[$@#!%*?&])[A-Za-z\\d$@#!%*?&]{8,}$')
			])],
			confirmPassword: ['', Validators.compose([Validators.required])],
		});
		this.updateEmailForm = this.formBuilder.group({
			email: ['', Validators.compose([Validators.required, Validators.email])],
			newEmail: ['', Validators.compose([Validators.required, Validators.email])],
			password: ['', Validators.compose([Validators.required])]
		});
	}

	ngAfterViewInit() {
		this.adjustFormContainerPosition();
		window.addEventListener('resize', this.adjustFormContainerPosition.bind(this));
	  }
	  
	  ngOnDestroy() {
		window.removeEventListener('resize', this.adjustFormContainerPosition.bind(this));
	  }
	  
	  adjustFormContainerPosition() {
		const windowHeight = window.innerHeight;
		const formContainerHeight = this.formContainer.nativeElement.offsetHeight;
		const formContainerTop = (windowHeight - formContainerHeight) / 2;
		this.formContainer.nativeElement.style.top = formContainerTop + 'px';
	  }

	ngOnInit(): void {
		this.drugService.getDrugs().subscribe((res) => {
			this.drugs = JSON.parse(res);
		});

		if (localStorage.getItem('userProfile')) {
			this.userProfile = JSON.parse(
				localStorage.getItem('userProfile') || ''
			);
			this.form = this.formBuilder.group({
				covidVaccine: [this.userProfile.covidVaccine, Validators.required],
				smoker: [this.userProfile.smoker, Validators.required],
				drinker: [this.userProfile.drinker, Validators.required],
				optOut: [this.userProfile.optOutOfPublicStories, Validators.required],
			});


		}
	}

	resetPassword() {
		this.formContainer.nativeElement.style.marginTop = '0';
		const val = this.resetPasswordForm.value;
		if (val.password !== val.confirmPassword) {
			alert('Passwords do not match');
			return;
		}

		this.authService.login(val.email, val.oldPassword).subscribe((res) => {
			if (res) {
				this.authService.resetPassword(val.email, val.password).subscribe((res2) => {
					if (res2) {
						alert('Password reset successfully');
						this.storageService.signout();
						this.store.dispatch(toggleAuth({ status: false }))
						this.router.navigateByUrl('/login');
					} else {
						alert('Failed to reset password');
					}
				});
			} else {
				alert('Failed to reset password');
			}
		});
	}

	updateEmail() {
		this.store.dispatch(toggleLoading({ status: true }))
		this.formContainer.nativeElement.style.marginTop = '0';
		const val = this.updateEmailForm.value;

		this.authService.login(val.email, val.password).subscribe((res) => {
			if (res) {
				this.authService.updateEmail(val.email, val.newEmail).subscribe((res2) => {
					if (res2) {
						alert('Email updated successfully');
						this.store.dispatch(toggleLoading({ status: false }));
						this.storageService.signout();
						this.store.dispatch(toggleAuth({ status: false }))
						this.router.navigateByUrl('/login');
					} else {
						this.store.dispatch(toggleLoading({ status: false }))
						alert('Failed to update Email');
					}
				});
			} else {
				this.store.dispatch(toggleLoading({ status: false }))
				alert('Failed to updateEmail');
			}
		});
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
		}, (err) => {
			alert('Failed to update profile');
		});

	}
}
