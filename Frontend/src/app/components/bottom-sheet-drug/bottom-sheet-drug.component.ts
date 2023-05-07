import { Store } from '@ngrx/store';
import { ProfileService } from 'src/app/services/profile.service';
import { StorageService } from 'src/app/services/storage.service';
import { setUserDrugs, toggleAuth, toggleLoading } from 'src/app/store/shared/actions/shared.actions';
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
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { getSharedState } from 'src/app/store/shared/selectors/shared.selector';
import { UserDrug } from 'src/app/types/userDrug';


@Component({
	selector: 'app-bottom-sheet',
	template: `
    <div *ngIf="!this.drugToEdit?.drugId" class="bottom-sheet-container">
        <input  (ngModelChange)="filterOptions()" placeholder="Medication" [(ngModel)]="filterTextDrug">
		<input placeholder="Dosage" name="dosage" [(ngModel)]="dosage" type="text" />
		<button *ngIf="!this.newDrug" (click)="addDrug(this.drugId)">Save</button>
		<button *ngIf="this.newDrug" (click)="addDrugAndCreate(this.filterTextDrug)">Save</button>
      <mat-list>
        <mat-list-item (click)="setDrug(option)" *ngFor="let option of filteredDrugs">
          {{ option.name }}
        </mat-list-item>
      </mat-list>
    </div>
	<div *ngIf="this.drugToEdit?.drugId" class="bottom-sheet-container">
		<mat-list>
    	    <mat-list-item>
    	      {{ this.filterTextDrug }}
    	    </mat-list-item>
    	</mat-list>
		<input placeholder="Dosage" name="dosage" [(ngModel)]="dosage" type="text" />
		<button (click)="updateDrug(this.drugId)">Save</button>
		<!-- <button *ngIf="this.newDrug" (click)="updateDrugAndCreate(this.drugId, this.filterTextDrug)">Save</button> -->
      
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
	  button {
		width: 50%;
		margin-left: 25%;
	  }
	}
  `]
})
export class BottomSheetDrugComponent implements OnInit {

	drugs: Array<Drug> = [];
	// Add problem type
	@Input() problems?: Array<any>
	drugToEdit?: UserDrug
	filteredDrugs = this.drugs.slice();
	filterTextDrug = '';
	drugId: number = 0;
	dosage = '';
	newDrug: boolean = false;

	constructor(private store: Store<AppState>, private router: Router, private drugService: DrugService, private bottomSheetRef: MatBottomSheetRef<BottomSheetDrugComponent>) { }

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
					this.getUserDrugs();
				}, (err) => {
					alert('Failed to add medication. Is this a duplicate?')
				});
		}
	}

	getUserDrugs() {
		this.drugService.getUserDrugs().subscribe((res) => {
			this.store.dispatch(setUserDrugs({userDrugs: JSON.parse(res) })) ;
			this.bottomSheetRef.dismiss();
			alert('Successfully updated medications');
		}, (err) => {
			alert('Failed to fetch updated medications')			
			this.store.dispatch(setUserDrugs({userDrugs: [] })) ;
			this.bottomSheetRef.dismiss();
		});
	}
	
	addDrugAndCreate(drugName: string) {
		if (localStorage.getItem('userProfile')) {
			let user = JSON.parse(localStorage.getItem('userProfile') || '');
			const userId = user.userId;
			this.drugService.addDrug({
				name: drugName,
				drugId: 0
			}).subscribe((newDrug: Drug) => {
				this.drugService
					.addUserDrug(userId, newDrug.drugId, this.dosage)
					.subscribe((res) => {
						// this.router.navigateByUrl('/profile');
						window.location.reload();
					}, (err) => {
						alert('Failed to add medication. Is this a duplicate?')
					});
			})


			// const val = this.dosage.value;


		}
	}

	setDrug(drug: Drug) {
		this.drugId = drug.drugId;
		this.filterTextDrug = drug.name;
		this.filterOptions();
	}

	updateDrug(drugId: number) {
		// if (!this.dosage) {
		// 	return;
		// }
		if (localStorage.getItem('userProfile') && this.drugToEdit) {
			let user = JSON.parse(localStorage.getItem('userProfile') || '');
			const userId = user.userId;
			// const val = this.dosage.value;

			this.drugToEdit.dosage = this.dosage;
			this.drugToEdit.drugId = drugId;

			this.drugService
				.updateUserDrug(this.drugToEdit)
				.subscribe((res) => {
					// this.router.navigateByUrl('/profile');
					this.getUserDrugs();
				}, (err) => {
					alert('Failed to update drug');
				});
		}
	}

	updateDrugAndCreate(drugId: number, drugName: string) {
		// if (!this.dosage) {
		// 	return;
		// }
		if (localStorage.getItem('userProfile')) {
			let user = JSON.parse(localStorage.getItem('userProfile') || '');
			const userId = user.userId;
			// const val = this.dosage.value;

			this.drugService.addDrug({
				name: drugName,
				drugId: 0
			}).subscribe((newDrug: Drug) => {
				if (this.drugToEdit) {
					this.drugToEdit.dosage = this.dosage;
					this.drugToEdit.drugId = drugId;

					this.drugService
						.updateUserDrug(this.drugToEdit)
						.subscribe((res) => {
							// this.router.navigateByUrl('/profile');
							this.getUserDrugs();
						}, (err) => {
							alert('Failed to update drug');
						});
				}
			});

		}
	}

	ngOnInit() {
		this.drugService.getDrugs().subscribe((res) => {
			this.drugs = JSON.parse(res);
			this.filteredDrugs = this.drugs.slice();
			this.store.select(getSharedState).subscribe((state) => {
				if (state.drugToEdit) {
					console.log('test')
					console.log(state.drugToEdit)
					this.drugToEdit = { ...state.drugToEdit };
					this.filterTextDrug = state.drugToEdit.drugName;
					this.dosage = state.drugToEdit.dosage;
					this.setDrug({ name: state.drugToEdit.drugName, drugId: state.drugToEdit.drugId })
					this.filterOptions();
				}
			})
		});

	}

	ngAfterViewInit() {

	}

	filterOptions() {
		this.filteredDrugs = this.drugs.filter(option =>
			option.name.toLowerCase().includes(this.filterTextDrug.toLowerCase())
		);
		if (this.filteredDrugs.length === 0) {
			this.newDrug = true;
			this.drugs = [{ name: this.filterTextDrug, drugId: 0 }]
		} else {
			this.newDrug = false;
		}
	}

	resetFilter() {
		this.filteredDrugs = this.drugs.slice();
		this.filterTextDrug = '';
	}
}