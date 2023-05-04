import { __decorate } from "tslib";
import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_IP } from './url';
const API_URL = API_IP + 'api/protected';
const headers = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};
let DrugService = class DrugService {
    constructor(http) {
        this.http = http;
    }
    getDrugs() {
        return this.http.get(API_URL + '/drug', {
            responseType: 'text',
        });
    }
    getDrug(drugId) {
        return this.http.get(API_URL + '/drug/get?drugId=' + drugId.toString());
    }
    getUserDrugs() {
        return this.http.get(API_URL + '/user/drugs/get', {
            responseType: 'text',
        });
    }
    addUserDrug(userId, drugId, dosage) {
        return this.http.post(API_URL + '/user/drugs/add', {
            userId,
            drugId,
            dosage,
        }, headers);
    }
    removeUserDrug(drugId) {
        return this.http.delete(API_URL + '/user/drugs/remove' + '?drugId=' + drugId, { responseType: 'text' });
    }
};
DrugService = __decorate([
    Injectable({
        providedIn: 'root',
    })
], DrugService);
export { DrugService };
//# sourceMappingURL=drug.service.js.map