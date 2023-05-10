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
	setUserStories,
	setExploreStories,
	setAverageMood,
	setIsMonthView,
	setStoryMood,
	setNotificationStories,
	setUserDrugs,
	setUserDisorders,
	setDrugs,
	setDisorders,
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
	}),
	on(setUserStories, (state, action) => {
		return {
			...state,
			userStories: action.stories
		}
	}),
	on(setExploreStories, (state, action) => {
		return {
			...state,
			exploreStories: action.stories
		}
	}),
	on(setAverageMood, (state, action) => {
		return {
			...state,
			averageMood: action.mood
			}
	}),	
	on(setIsMonthView, (state, action) => {
		return {
			...state,
			isMonthView: action.isMonthView
		}
	}),
	on(setStoryMood, (state, action) => {
		return {
			...state,
			storyMood: action.mood
		}
	}),
	on(setNotificationStories, (state, action) => {
		return {
			...state,
			notificationStories: action.notificationStories
		}
	}),
	on(setUserDrugs, (state, action) => {
		return {
			...state,
			userDrugs: action.userDrugs
		}
	}),
	on(setUserDisorders, (state, action) => {
		return {
			...state,
			userDisorders: action.userDisorders
		}
	}),
	on(setDrugs, (state, action) => {
		return {
			...state,
			drugs: action.drugs
		}
	}),
	on(setDisorders, (state, action) => {
		return {
			...state,
			disorders: action.disorders
		}
	})
);
