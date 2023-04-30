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
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';


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