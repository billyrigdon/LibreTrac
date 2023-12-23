import {
	Component,
	ElementRef,
	EventEmitter,
	OnInit,
	Output,
	ViewChild,
} from '@angular/core';
import {
	UntypedFormBuilder,
	UntypedFormGroup,
	Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { DrugService } from 'src/app/services/drug.service';
import { StorageService } from 'src/app/services/storage.service';
import { Drug } from 'src/app/types/drug';

// TODO: This needs to be optimized. There's no reason that it should pull in a thousand drugs every time the search opens
@Component({
	selector: 'app-search-modal',
	templateUrl: './search-modal.component.html',
	styleUrls: ['./search-modal.component.scss'],
})
export class SearchModalComponent implements OnInit {
	@Output() onCancel = new EventEmitter();
	@Output() onSearchEvent = new EventEmitter();
	drugs: Array<Drug>;
	form: UntypedFormGroup;
	filteredDrugs1: any;
	filterTextDrug1 = '';

	filteredDrugs2: any;
	filterTextDrug2 = '';
	drug1: number = 0;
	drug2: number = 0;
	@ViewChild('searchInput1') searchInput1!: ElementRef;

	constructor(
		private drugService: DrugService,
		private formBuilder: UntypedFormBuilder,
		private storageService: StorageService,
		private router: Router,
	) {
		this.drugs = [];
		this.form = this.formBuilder.group({
			drugX: [0, Validators.required],
			drugY: [0],
		});
	}

	ngOnInit() {
		this.drugService.getDrugs().subscribe((res) => {
			this.drugs = JSON.parse(res);
			this.filteredDrugs1 = [];
			this.filteredDrugs2 = [];
		});
	}

	ngAfterViewInit() {
		this.searchInput1.nativeElement.focus();
	}

	filterOptions1() {
		if (this.filterTextDrug1.toLowerCase().replace(' ', '')) {
			this.filteredDrugs1 = this.drugs.filter((option) =>
				option.name
					.toLowerCase()
					.includes(this.filterTextDrug1.toLowerCase()),
			);
		}
	}

	resetFilter1() {
		this.filteredDrugs1 = [];
		this.filterTextDrug1 = '';
	}

	filterOptions2() {
		if (this.filterTextDrug2.toLowerCase().replace(' ', '')) {
			this.filteredDrugs2 = this.drugs.filter((option) =>
				option.name
					.toLowerCase()
					.includes(this.filterTextDrug2.toLowerCase()),
			);
		}
	}

	setDrug1(drug: Drug) {
		this.drug1 = drug.drugId;
		console.log(drug);
	}

	setDrug2(drug: Drug) {
		this.drug2 = drug.drugId;
	}

	resetFilter2() {
		this.filteredDrugs2 = this.drugs.slice();
		this.filterTextDrug2 = '';
	}

	cancel() {
		this.onCancel.emit();
	}

	onSearch() {
		this.router
			.navigateByUrl(
				'/explore?drugX=' +
					(this.drug1 != 0 ? this.drug1 : '') +
					'&drugY=' +
					(this.drug2 != 0 ? this.drug2 : ''),
			)
			.then(() => window.location.reload());
	}
}
