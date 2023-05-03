import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserDrug } from '../types/userDrug';
import { API_IP } from './url';

const API_URL = API_IP + 'api/protected';
const headers = {
	headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
	providedIn: 'root',
})
export class DrugService {
	constructor(private http: HttpClient) {}

	getDrugs() {
		return this.http.get(API_URL + '/drug', {
			responseType: 'text',
		});
	}

	getDrug(drugId: number) {
		return this.http.get(API_URL + '/drug/get?drugId=' + drugId.toString());
	}

	getUserDrugs() {
		return this.http.get(API_URL + '/user/drugs/get', {
			responseType: 'text',
		});
	}

	addUserDrug(userId: number, drugId: number, dosage: string) {
		return this.http.post(
			API_URL + '/user/drugs/add',
			{
				userId,
				drugId,
				dosage,
			},
			headers
		);
	}

	updateUserDrug(userId: number, drugId: number, dosage: string) {
		return this.http.post(
			API_URL + '/user/drugs/update',
			{
				userId,
				drugId,
				dosage,
			},
			headers
		);
	}

	removeUserDrug(drugId: number) {
		return this.http.delete(
			API_URL + '/user/drugs/remove' + '?drugId=' + drugId,
			{ responseType: 'text' }
		);
	}

	
	
}
