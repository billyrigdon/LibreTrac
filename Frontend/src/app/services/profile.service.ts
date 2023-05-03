import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserProfile } from '../types/user';
import { API_IP } from './url';

const API_URL = API_IP + 'api/protected/user';
const headers = {
	headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
	providedIn: 'root',
})
export class ProfileService {
	constructor(private http: HttpClient) {}

	createProfile(userProfile: UserProfile) {
		return this.http.post(API_URL + '/create', userProfile, headers);
	}

	updateProfile(userProfile: UserProfile) {
		return this.http.post(API_URL + '/update', userProfile, headers);
	}

	setProfile(userProfile: Object) {
		localStorage.setItem('userProfile', JSON.stringify(userProfile));
		
	}

	getProfile() {
		return this.http.get(API_URL, headers);
	}

	removeProfile() {
		localStorage.removeItem('userProfile');
	}
}
