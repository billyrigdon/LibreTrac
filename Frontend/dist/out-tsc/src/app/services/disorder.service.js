import { __decorate } from "tslib";
import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_IP } from './url';
const API_URL = API_IP + 'api/protected';
const headers = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};
let DisorderService = class DisorderService {
    constructor(http) {
        this.http = http;
    }
    getDisorders() {
        return this.http.get(API_URL + '/disorder', {
            responseType: 'text',
        });
    }
    getDisorder(disorderId) {
        return this.http.get(API_URL + '/disorder/get?disorderId=' + disorderId.toString());
    }
    getUserDisorders() {
        return this.http.get(API_URL + '/user/disorders/get', {
            responseType: 'text',
        });
    }
    addUserDisorder(userId, disorderId) {
        return this.http.post(API_URL + '/user/disorders/add', {
            userId,
            disorderId,
            // diagnoseDate,
        }, headers);
    }
    removeUserDisorder(disorderId) {
        return this.http.delete(API_URL + '/user/disorders/remove' + '?disorderId=' + disorderId, { responseType: 'text' });
    }
};
DisorderService = __decorate([
    Injectable({
        providedIn: 'root',
    })
], DisorderService);
export { DisorderService };
//# sourceMappingURL=disorder.service.js.map