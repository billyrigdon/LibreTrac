import { __decorate } from "tslib";
import { HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { API_IP } from "./url";
const API_URL = API_IP + "api/public";
const headers = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
let AuthService = class AuthService {
    constructor(http) {
        this.http = http;
    }
    login(email, password) {
        return this.http.post(API_URL + "/login", {
            email,
            password
        }, headers);
    }
    signup(username, email, password) {
        return this.http.post(API_URL + "/signup", {
            username,
            email,
            password
        }, headers);
    }
    tokenExpired(token) {
        const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
        return (Math.floor((new Date).getTime() / 1000)) >= expiry;
    }
};
AuthService = __decorate([
    Injectable({
        providedIn: "root"
    })
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map