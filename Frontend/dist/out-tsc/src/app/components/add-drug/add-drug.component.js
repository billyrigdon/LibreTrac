import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
let AddDrugComponent = class AddDrugComponent {
    constructor(drugService, formBuilder, storageService, router) {
        this.drugService = drugService;
        this.formBuilder = formBuilder;
        this.storageService = storageService;
        this.router = router;
        this.drugs = [];
        this.form = this.formBuilder.group({
            drugId: [0],
            dosage: ['', Validators.required],
        });
    }
    addDrug() {
        if (localStorage.getItem('userProfile')) {
            let user = JSON.parse(localStorage.getItem('userProfile') || '');
            const userId = user.userId;
            const val = this.form.value;
            this.drugService
                .addUserDrug(userId, parseInt(val.drugId), val.dosage)
                .subscribe((res) => {
                this.router.navigateByUrl('/profile');
            });
        }
    }
    ngOnInit() {
        this.drugService.getDrugs().subscribe((res) => {
            this.drugs = JSON.parse(res);
        });
    }
};
AddDrugComponent = __decorate([
    Component({
        selector: 'app-add-drug',
        templateUrl: './add-drug.component.html',
        styleUrls: ['./add-drug.component.scss'],
    })
], AddDrugComponent);
export { AddDrugComponent };
//# sourceMappingURL=add-drug.component.js.map