import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SharedState } from '../shared.state';

export const SHARED_STATE_NAME = 'shared';

const getSharedState = createFeatureSelector<SharedState>(SHARED_STATE_NAME);

export const getLoading = createSelector(getSharedState, (state) => {
	return state.isLoading;
});

export const getAuthState = createSelector(getSharedState, (state) => {
	return state.isAuth;
});

export const getUserId = createSelector(getSharedState, (state) => {
	return state.userId;
});

export const getNotiesOpen = createSelector(getSharedState, (state) => {
	return state.notiesOpen;
});