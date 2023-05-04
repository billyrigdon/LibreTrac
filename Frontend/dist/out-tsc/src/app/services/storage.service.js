import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
const TOKEN_KEY = 'token';
const USERNAME = 'username';
let StorageService = class StorageService {
    constructor() { }
    signout() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USERNAME);
    }
    saveUser(username) {
        localStorage.removeItem(USERNAME);
        localStorage.setItem(USERNAME, username);
    }
    saveToken(token) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.setItem(TOKEN_KEY, token);
    }
    getToken() {
        return localStorage.getItem(TOKEN_KEY);
    }
    getUser() {
        return localStorage.getItem(USERNAME);
    }
};
StorageService = __decorate([
    Injectable({
        providedIn: 'root',
    })
], StorageService);
export { StorageService };
//# sourceMappingURL=storage.service.js.map