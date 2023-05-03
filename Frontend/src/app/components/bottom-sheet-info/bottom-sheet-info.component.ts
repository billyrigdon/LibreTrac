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