import { Injectable } from '@angular/core';

const TOKEN_KEY = 'token';
const USERNAME = 'username';

@Injectable({
	providedIn: 'root',
})
export class StorageService {
	constructor() {}

	signout(): void {
		localStorage.removeItem(TOKEN_KEY);
		localStorage.removeItem(USERNAME);
		
	}

	public saveUser(username: string): void {
		localStorage.removeItem(USERNAME);
		localStorage.setItem(USERNAME, username);
	}

	public saveToken(token: string): void {
		localStorage.removeItem(TOKEN_KEY);
		localStorage.setItem(TOKEN_KEY, token);
	}

	public getToken(): string | null {
		return localStorage.getItem(TOKEN_KEY);
	}

	public getUser(): string | null {
		return localStorage.getItem(USERNAME)
	}
}
