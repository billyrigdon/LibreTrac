import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DrugService } from 'src/app/services/drug.service';
import { StorageService } from 'src/app/services/storage.service';
import { Drug } from 'src/app/types/drug';

@Component({
	selector: 'app-add-drug',
	templateUrl: './add-drug.component.html',
	styleUrls: ['./add-drug.component.scss'],
})
export class AddDrugComponent implements OnInit {
	drugs: Array<Drug>;
	form: UntypedFormGroup;

	constructor(
		private drugService: DrugService,
		private formBuilder: UntypedFormBuilder,
		private storageService: StorageService,
		private router: Router
	) {
		this.drugs = [];
		this.form = this.formBuilder.group({
			drugId: [0],
			dosage: ['', Validators.required],
		});
	}

	addDrug() {
		if (localStorage.getItem('userProfile')) {
			let user = JSON.parse(localStorage.getItem('userProfile') || '');
			const userId = user.userId;
			const val = this.form.value;

			this.drugService
				.addUserDrug(userId, parseInt(val.drugId), val.dosage)
				.subscribe((res) => {
					this.router.navigateByUrl('/profile');
				});
		}
	}

	ngOnInit(): void {
		this.drugService.getDrugs().subscribe((res) => {
			this.drugs = JSON.parse(res);
		});
	}
}
