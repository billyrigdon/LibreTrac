export interface SharedState {
	isLoading: boolean;
	isAuth: boolean;
	userId: number;
	notiesOpen: boolean;
}

export const initialState: SharedState = {
	isLoading: false,
	isAuth: false,
	userId: 0,
	notiesOpen: false
};
