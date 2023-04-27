import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { BifrostService } from 'src/app/services/bifrost.service';
import { DrugInfo } from 'src/app/types/drug';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-drug-info',
  templateUrl: './drug-info.component.html',
  styleUrls: ['./drug-info.component.scss']
})
export class DrugInfoComponent implements OnInit {
  drugInfo: DrugInfo;
  constructor(private route: ActivatedRoute, private bifrostService: BifrostService, private dialog: MatDialog, private router: Router) {
    this.drugInfo = {} as DrugInfo;
   }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
			const drugName = params['drugName'];
			this.bifrostService.getDrugInfo(drugName).subscribe((res: DrugInfo) => {
        this.drugInfo = res;
        if (!this.drugInfo) {
          const dialogRef = this.dialog.open(ModalComponent, {
            width: '500px',
            height: '500px',
          });
          dialogRef.componentInstance.message = 'Drug information not found in database. Send an email to druginfo@libretrac.io to have information added.';
          dialogRef.componentInstance.buttonText = 'Ok';
          dialogRef.componentInstance.onClose.subscribe((event: any) => {
            dialogRef.close()
            this.router.navigateByUrl('/profile')
          });
        }
      },
      (err) => {
        const dialogRef = this.dialog.open(ModalComponent, {
          width: '500px',
          height: '500px',
        });
        dialogRef.componentInstance.message = 'Query returned error:' + err;
        dialogRef.componentInstance.buttonText = 'Ok';
        dialogRef.componentInstance.onClose.subscribe((event: any) => {
          dialogRef.close()
          this.router.navigateByUrl('/profile')
        });
      });
		});
  }

}


