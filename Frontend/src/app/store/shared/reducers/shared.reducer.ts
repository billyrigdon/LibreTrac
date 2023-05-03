import {
	Action,
	ActionReducer,
	ActionReducerMap,
	createFeatureSelector,
	createReducer,
	createSelector,
	MetaReducer,
	on,
} from '@ngrx/store';
import { environment } from '../../../../environments/environment';
import {
	toggleAuth,
	toggleLoading,
	setUserId,
	toggleNoties,
	setStoryToEdit,
	setDrugToEdit,
} from '../actions/shared.actions';
import { initialState, SharedState } from '../shared.state';

export const _sharedReducer = createReducer(
	initialState,
	on(toggleLoading, (state, action) => {
		return {
			...state,
			isLoading: action.status,
		};
	}),
	on(toggleAuth, (state, action) => {
		return {
			...state,
			isAuth: action.status,
		};
	}),
	on(setUserId, (state, action) => {
		return {
			...state,
			userId: action.userId,
		};
	}),
	on(toggleNoties, (state, action) => {
		return {
			...state,
			notiesOpen: action.open,
			};
	}),
	on(setStoryToEdit, (state, action) => {
		return {
			...state,
			storyToEdit: action.story,
		};
	}),
	on(setDrugToEdit, (state, action) => {
		return {
			...state,
			drugToEdit: action.drug
		}
	})
);
