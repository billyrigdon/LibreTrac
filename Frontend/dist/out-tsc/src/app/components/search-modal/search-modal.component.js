import { __decorate } from "tslib";
import { Component, EventEmitter, Output } from '@angular/core';
import { Validators } from '@angular/forms';
let SearchModalComponent = class SearchModalComponent {
    constructor(drugService, formBuilder, storageService, router) {
        this.drugService = drugService;
        this.formBuilder = formBuilder;
        this.storageService = storageService;
        this.router = router;
        this.onCancel = new EventEmitter();
        this.onSearchEvent = new EventEmitter();
        this.filterTextDrug1 = '';
        this.filterTextDrug2 = '';
        this.drug1 = 0;
        this.drug2 = 0;
        this.drugs = [];
        this.form = this.formBuilder.group({
            drugX: [0, Validators.required],
            drugY: [0],
        });
    }
    ngOnInit() {
        this.drugService.getDrugs().subscribe((res) => {
            this.drugs = JSON.parse(res);
            this.filteredDrugs1 = this.drugs.slice();
            this.filteredDrugs2 = this.drugs.slice();
        });
    }
    filterOptions1() {
        this.filteredDrugs1 = this.drugs.filter(option => option.name.toLowerCase().includes(this.filterTextDrug1.toLowerCase()));
    }
    resetFilter1() {
        this.filteredDrugs1 = this.drugs.slice();
        this.filterTextDrug1 = '';
    }
    filterOptions2() {
        this.filteredDrugs2 = this.drugs.filter(option => option.name.toLowerCase().includes(this.filterTextDrug2.toLowerCase()));
    }
    setDrug1(drug) {
        this.drug1 = drug.drugId;
        console.log(drug);
    }
    setDrug2(drug) {
        this.drug2 = drug.drugId;
    }
    resetFilter2() {
        this.filteredDrugs2 = this.drugs.slice();
        this.filterTextDrug2 = '';
    }
    cancel() {
        this.onCancel.emit();
    }
    onSearch() {
        this.router.navigateByUrl('/explore?drugX=' + (this.drug1 != 0 ? this.drug1 : "") + '&drugY=' + (this.drug2 != 0 ? this.drug2 : "")).then(() => window.location.reload());
    }
};
__decorate([
    Output()
], SearchModalComponent.prototype, "onCancel", void 0);
__decorate([
    Output()
], SearchModalComponent.prototype, "onSearchEvent", void 0);
SearchModalComponent = __decorate([
    Component({
        selector: 'app-search-modal',
        templateUrl: './search-modal.component.html',
        styleUrls: ['./search-modal.component.scss']
    })
], SearchModalComponent);
export { SearchModalComponent };
//# sourceMappingURL=search-modal.component.js.map