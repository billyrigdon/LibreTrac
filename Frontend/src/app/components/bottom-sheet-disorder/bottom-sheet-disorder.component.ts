

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
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BottomSheetDrugComponent } from '../bottom-sheet-drug/bottom-sheet-drug.component';




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
