import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
let DrugInfoComponent = class DrugInfoComponent {
    constructor(route, bifrostService, dialog, router) {
        this.route = route;
        this.bifrostService = bifrostService;
        this.dialog = dialog;
        this.router = router;
        this.drugInfo = {};
    }
    ngOnInit() {
        this.route.queryParams.subscribe((params) => {
            const drugName = params['drugName'];
            this.bifrostService.getDrugInfo(drugName).subscribe((res) => {
                this.drugInfo = res;
                if (!this.drugInfo) {
                    const dialogRef = this.dialog.open(ModalComponent, {
                        width: '500px',
                        height: '500px',
                    });
                    dialogRef.componentInstance.message = 'Drug information not found in database. Send an email to druginfo@shulgin.io to have information added.';
                    dialogRef.componentInstance.buttonText = 'Ok';
                    dialogRef.componentInstance.onClose.subscribe((event) => {
                        dialogRef.close();
                        this.router.navigateByUrl('/profile');
                    });
                }
            }, (err) => {
                const dialogRef = this.dialog.open(ModalComponent, {
                    width: '500px',
                    height: '500px',
                });
                dialogRef.componentInstance.message = 'Query returned error:' + err;
                dialogRef.componentInstance.buttonText = 'Ok';
                dialogRef.componentInstance.onClose.subscribe((event) => {
                    dialogRef.close();
                    this.router.navigateByUrl('/profile');
                });
            });
        });
    }
};
DrugInfoComponent = __decorate([
    Component({
        selector: 'app-drug-info',
        templateUrl: './drug-info.component.html',
        styleUrls: ['./drug-info.component.scss']
    })
], DrugInfoComponent);
export { DrugInfoComponent };
//# sourceMappingURL=drug-info.component.js.map