import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Disorder, UserDisorder } from '../types/disorder';
import { API_IP } from './url';

const API_URL = API_IP + 'api/protected';
const headers = {
	headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
	providedIn: 'root',
})
export class DisorderService {
	constructor(private http: HttpClient) {}

	getDisorders() {
		return this.http.get(API_URL + '/disorder', {
			responseType: 'text',
		});
	}

	getDisorder(disorderId: number) {
		return this.http.get(API_URL + '/disorder/get?disorderId=' + disorderId.toString());
	}

	getUserDisorders() {
		return this.http.get(API_URL + '/user/disorders/get', {
			responseType: 'text',
		});
	}

	addUserDisorder(userId: number, disorderId: number) {
		return this.http.post(
			API_URL + '/user/disorders/add',
			{
				userId,
				disorderId,
				// diagnoseDate,
			},
			headers
		);
	}

	removeUserDisorder(disorderId: number) {
		return this.http.delete(
			API_URL + '/user/disorders/remove' + '?disorderId=' + disorderId,
			{ responseType: 'text' }
		);
	}

	
	
}
