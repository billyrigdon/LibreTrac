import { createAction, props } from '@ngrx/store';

export const toggleLoading = createAction(
	'TOGGLE_LOADING',
	props<{ status: boolean }>()
);

export const toggleAuth = createAction(
	'TOGGLE_AUTH',
	props<{ status: boolean }>()
);

export const toggleNoties = createAction(
	'toggleNoties',
	props<{ open: boolean }>()
);

export const setUserId = createAction('SET_USER', props<{ userId: number }>());



