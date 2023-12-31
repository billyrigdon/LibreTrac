

import { Store } from '@ngrx/store';
import { ProfileService } from 'src/app/services/profile.service';
import { StorageService } from 'src/app/services/storage.service';
import { setUserDisorders, toggleAuth, toggleLoading } from 'src/app/store/shared/actions/shared.actions';
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
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BottomSheetDrugComponent } from '../bottom-sheet-drug/bottom-sheet-drug.component';
import { getSharedState } from 'src/app/store/shared/selectors/shared.selector';
import { Subscription } from 'rxjs';




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
export class BottomSheetDisorderComponent implements OnInit, OnDestroy {

	disorders: Array<Disorder> = [];
	filteredDisorders = this.disorders.slice();
	filterTextDisorder = '';
	stateSub$!: Subscription;



	constructor(private router: Router, private disorderService: DisorderService, private bottomSheetRef: MatBottomSheetRef<BottomSheetDrugComponent>, private store: Store<AppState>) { }



	addDisorder(disorderId: number) {
		if (localStorage.getItem('userProfile')) {
			let user = JSON.parse(localStorage.getItem('userProfile') || '');
			const userId = user.userId;

			this.disorderService
				.addUserDisorder(userId, disorderId)
				.subscribe((res) => {
					this.getUserDisorders();
				}, (err) => {
					alert('Failed to add disorder. Is this a duplicate?')
				});
		}
	}

	getUserDisorders() {
		this.store.dispatch(toggleLoading({ status: true }));
		this.disorderService.getUserDisorders().subscribe((res) => {
			this.store.dispatch(setUserDisorders({userDisorders: JSON.parse(res) })) ;
			this.store.dispatch(toggleLoading({ status: false }));
			this.bottomSheetRef.dismiss();
			alert('Disorder added successfully')
			
		}, (err) => {
			console.log(err);
			this.store.dispatch(setUserDisorders({userDisorders: []})) ;
			this.store.dispatch(toggleLoading({ status: false }));
			this.bottomSheetRef.dismiss();
			alert('Failed to fetch updated disorders.')
		});
	}

	ngOnInit() {
		this.stateSub$ = this.store.select(getSharedState).subscribe((state) => {
			this.disorders = state.disorders;
			this.filteredDisorders = this.disorders.slice();
		})
	}

	ngOnDestroy(): void {
		this.stateSub$.unsubscribe();
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
