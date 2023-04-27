export type Disorder = {
	disorderId: number;
	disorderName: string;
}

export type UserDisorder = {
	userDisorderId: number;
	userId: number;
	disorderId: number;
	disorderName: string;
	diagnoseDate: Date;
}