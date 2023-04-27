export type Drug = {
	name: string;
	drugId: number;
}

export type DrugInfo = {
	name: string;
	summary: string;
	effects: {
	  name: string;
	}[];
	tolerance: {
	  full: string;
	  half: string;
	  zero: string;
	};
	roa: {
	  oral: {
		dose: {
		  units: string;
		  threshold: number;
		  heavy: number;
		  light: {
			min: number;
			max: number;
		  };
		  common: {
			min: number;
			max: number;
		  };
		  strong: {
			min: number;
			max: number;
		  };
		};
	  };
	};
	uncertainInteractions: {
	  name: string;
	}[];
	unsafeInteractions: {
	  name: string;
	}[];
	dangerousInteractions: {
	  name: string;
	}[];
  };