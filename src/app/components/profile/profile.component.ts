import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService } from 'src/app/services/profile.service';
import { StoryService } from 'src/app/services/story.service';
import { StorageService } from 'src/app/services/storage.service';
import { UserProfile } from 'src/app/types/user';
import { Story, StoryDrug } from '../../types/story';
import { UserDrug } from 'src/app/types/userDrug';
import { DrugService } from 'src/app/services/drug.service';
import { DatePipe, formatDate } from '@angular/common';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import { setUserId, toggleAuth, toggleLoading } from 'src/app/store/shared/actions/shared.actions';
import { getAuthState } from 'src/app/store/shared/selectors/shared.selector';
import { ModalComponent } from '../modal/modal.component';
import { MatDialog } from '@angular/material/dialog';
import { WarningComponent } from '../warning/warning.component';
import { FormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { BottomSheetDisorderComponent, BottomSheetDrugComponent, BottomSheetInfoComponent } from '../profile-settings/profile-settings.component';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Drug } from 'src/app/types/drug';
import { UserDisorder } from 'src/app/types/disorder';
import { DisorderService } from 'src/app/services/disorder.service';
import axios from 'axios';
import cheerio from "cheerio";
import { MoodService } from 'src/app/services/mood.service';

interface DisorderInfo {
	title: string;
	summary: string;
	categories: string[];
	images: string[];
}



@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',
	styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
	stories: Array<StoryDrug>;
	userDrugs: Array<UserDrug>;
	userDisorders: Array<UserDisorder>;
	userProfile: UserProfile;
	profilePic: string;
	drugs: Array<Drug>;
	isMonthView: boolean = false;

	illnesses = [
		{ name: 'Bipolar Disorder Type I' },
		{ name: 'Attention Deficit Hyperactive Disorder - Combined' },
		{ name: 'Insomnia Disorder' },
		{ name: 'Generalized Anxiety Disorder' }
	];
	drugForm: UntypedFormGroup;
	userId: number = 0;
	mood: StoryDrug = <StoryDrug>{};

	constructor(
		private storyService: StoryService,
		private router: Router,
		private storageService: StorageService,
		private profileService: ProfileService,
		private drugService: DrugService,
		private datepipe: DatePipe,
		private store: Store<AppState>,
		private dialog: MatDialog,
		private formBuilder: FormBuilder,
		private bottomSheet: MatBottomSheet,
		private disorderService: DisorderService,
		private moodService: MoodService
	) {
		this.stories = [];
		this.userDrugs = Array<UserDrug>();
		this.userDisorders = Array<UserDisorder>();
		this.userProfile = <UserProfile>{};
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

	openBottomSheetInfo(summary: string, id: number, isDrug: boolean) {
		const bottomSheetRef: MatBottomSheetRef<BottomSheetInfoComponent> = this.bottomSheet.open(BottomSheetInfoComponent);
		bottomSheetRef.instance.summary = summary;
		bottomSheetRef.instance.id = id;
		bottomSheetRef.instance.isDrug = isDrug;
		bottomSheetRef.afterDismissed().subscribe(() => {
			console.log('Bottom sheet dismissed');
		});
	}

	switchView(isMonth: boolean) {
		this.mood = <StoryDrug>{}; // reset mood
		this.isMonthView = isMonth;
		if (this.isMonthView) {
			this.moodService.getAverageUserMoodForMonth(this.userId).subscribe((res) => {
				console.log(res);
				this.mood = JSON.parse(res);
			},
				(err) => {
					this.mood = <StoryDrug>{};
				});
		} else {
			this.moodService
					.getAverageUserMood(this.userId)
					.subscribe((res) => {
						console.log(res);
						this.mood = JSON.parse(res);
					},
						(err) => {
							this.mood = <StoryDrug>{};
						});
		}
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



	async getSummary(name: string, id: number, isDrug: boolean): Promise<any> {
		const apiEndpoint = "https://en.wikipedia.org/api/rest_v1/page/summary/";
		const encodedTitle = encodeURI(name);
		const url = `${apiEndpoint}${encodedTitle}`;

		try {
			const response = await axios.get(url);
			const summary = response.data.extract;
			this.openBottomSheetInfo(summary, id, isDrug);
			return { contents: summary };
		} catch (error) {
			this.openBottomSheetInfo('No information found', id, isDrug);
			return null;
		}
	}

	removeUserDrug(drugId: number) {
		const dialogRef = this.dialog.open(WarningComponent, {
			width: '500px',
			height: '500px',
		});
		dialogRef.componentInstance.message = 'Are you sure you want to remove this drug?';
		dialogRef.componentInstance.onCancel.subscribe((event: any) => {
			dialogRef.close();
			this.router.navigateByUrl('/profile')
		});
		dialogRef.componentInstance.onConfirm.subscribe(() => {
			this.drugService.removeUserDrug(drugId).subscribe((res) => {
				window.location.reload();
			});
		})
	}

	searchForDrug(drugId: number) {
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

	goToDrugInfo(drugName: string) {
		this.router.navigateByUrl('/drugInfo?drugName=' + drugName)
	}

	ngOnInit(): void {
		//Check if logged in and navigate to splash if not
		if (this.storageService.getToken() && this.storageService.getUser()) {
			//TODO: Move userprofile to shared state instead of handling it this way
			if (localStorage.getItem('userProfile')) {
				this.store.dispatch(toggleLoading({ status: true }));
				this.profileService.getProfile().subscribe((res) => {
					this.profileService.setProfile(res)
				})
				//Get user fields from user stored in local storage
				this.userProfile = JSON.parse(
					localStorage.getItem('userProfile') || ''
				);

				this.userId = this.userProfile.userId;
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

				this.switchView(false);
				

				//Get Profile if it does not exist in local storage
			} else {
				this.profileService.getProfile().subscribe((res) => {
					this.profileService.setProfile(res);

					//If user profile successfully saved, reload page
					if (localStorage.getItem('userProfile')) {
						window.location.reload();

						//If couldn't get user profile, navigate to createProfile page
					} else {
						this.router.navigateByUrl('/createProfile');
					}
				});
			}
		} else {
			this.storageService.signout();
			this.store.dispatch(toggleAuth({ status: false }));
			this.router.navigateByUrl('/login');
		}
	}
}
