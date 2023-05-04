import { __decorate } from "tslib";
import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_IP } from './url';
const API_URL = API_IP + 'api/protected/user';
const headers = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};
let ProfileService = class ProfileService {
    constructor(http) {
        this.http = http;
    }
    createProfile(userProfile) {
        return this.http.post(API_URL + '/create', userProfile, headers);
    }
    updateProfile(userProfile) {
        return this.http.post(API_URL + '/update', userProfile, headers);
    }
    setProfile(userProfile) {
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
    }
    getProfile() {
        return this.http.get(API_URL, headers);
    }
    removeProfile() {
        localStorage.removeItem('userProfile');
    }
};
ProfileService = __decorate([
    Injectable({
        providedIn: 'root',
    })
], ProfileService);
export { ProfileService };
//# sourceMappingURL=profile.service.js.map