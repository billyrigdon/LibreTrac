import { Store } from '@ngrx/store';
import { ProfileService } from 'src/app/services/profile.service';
import { StorageService } from 'src/app/services/storage.service';
import { setUserDisorders, setUserDrugs, toggleAuth, toggleLoading } from 'src/app/store/shared/actions/shared.actions';
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
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { BottomSheetDrugComponent } from '../bottom-sheet-drug/bottom-sheet-drug.component';


@Component({
	selector: 'app-bottom-sheet',
	template: `
	<div class="button-actions-top">
		<span *ngIf="isDrug" (click)="this.edit()" [style]="{color: '#b39cd0'}" role="button" class='material-icons'>edit</span>
	</div>
    <div class="bottom-sheet-container">
       <p>{{summary}} {{url}}</p>
    </div>
	<div class="button-actions-bottom">
		<span (click)="this.confirmDelete()" [style]="{color: '#FF0000'}" role="button" class='material-icons'>delete</span>
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
	  overflow-y: auto;
	  overflow-x: hidden;
	  /* margin: 24px; */
	  p {
		/* overflow-y: scroll !important; */
		margin-top: 8px;
		margin-left: 5%;
		width: 90% !important;
		padding: 12px !important;
		height: 90%;
	  }
	  .url {
		height: 10%;
		/* margin-top: 36px !important; */
	  }
	}
	.button-actions-top {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: flex-end;
		width: 100%;
	}
	.button-actions-bottom {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: flex-start;
		width: 100%;
	}
	span {
		position: sticky !important;
		padding: 12px !important;
	  }
  `]
})
export class BottomSheetInfoComponent implements OnInit {
	summary: string = ''
	id: number = 0;
	isDrug: boolean = false;
	@Output() onEdit = new EventEmitter()
	url: string = '';

	constructor(private router: Router, private drugService: DrugService, private bottomSheetRef: MatBottomSheetRef<BottomSheetDrugComponent>, private disorderService: DisorderService, private dialog: MatDialog, private store: Store<AppState>) { }

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
			dialogRef.close();
			this.onRemove();
		});
	}

	getUserDrugs() {
		this.drugService.getUserDrugs().subscribe((res) => {
			this.store.dispatch(setUserDrugs({userDrugs: JSON.parse(res) })) ;
			this.bottomSheetRef.dismiss();
			alert('Medication deleted')
		}, (err) => {
			alert('Failed to get updated medications')
			this.store.dispatch(setUserDrugs({userDrugs: [] })) ;
			this.bottomSheetRef.dismiss();
		});
	}

	getUserDisorders() {
		this.disorderService.getUserDisorders().subscribe((res) => {
			this.store.dispatch(setUserDisorders({userDisorders: JSON.parse(res) })) ;
			this.bottomSheetRef.dismiss();
			alert('Problem deleted')
		}, (err) => {
			alert('Failed to get updated problems')
			this.store.dispatch(setUserDisorders({userDisorders: []})) ;
			this.bottomSheetRef.dismiss();
		});
	}

	onRemove() {
		if (this.isDrug) {
			this.drugService.removeUserDrug(this.id).subscribe((res) => this.getUserDrugs(), (err) => { this.summary = 'Failed to delete' })
		} else {
			this.disorderService.removeUserDisorder(this.id).subscribe((res) => this.getUserDisorders(), (err) => { this.summary = 'Failed to delete' })
		}
	}

	edit() {
		this.onEdit.emit()
	}

	ngOnInit() {
		
	}

}