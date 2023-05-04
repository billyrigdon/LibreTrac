import { __decorate } from "tslib";
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Injectable } from '@angular/core';
const TOKEN_HEADER_KEY = 'Authorization';
//Intercept all http requests and add authentication header using token from session storage
let AuthInterceptor = class AuthInterceptor {
    constructor(storageService) {
        this.storageService = storageService;
    }
    intercept(req, next) {
        let authReq = req;
        const token = this.storageService.getToken();
        if (token != null) {
            authReq = req.clone({
                headers: req.headers.set(TOKEN_HEADER_KEY, 'Bearer ' + token),
            });
        }
        return next.handle(authReq);
    }
};
AuthInterceptor = __decorate([
    Injectable()
], AuthInterceptor);
export { AuthInterceptor };
export const AuthInterceptorProviders = [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
];
//# sourceMappingURL=auth.interceptor.js.map