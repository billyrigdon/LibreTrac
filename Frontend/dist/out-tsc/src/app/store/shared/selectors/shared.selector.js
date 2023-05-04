import { createFeatureSelector, createSelector } from '@ngrx/store';
export const SHARED_STATE_NAME = 'shared';
const getSharedState = createFeatureSelector(SHARED_STATE_NAME);
export const getLoading = createSelector(getSharedState, (state) => {
    return state.isLoading;
});
export const getAuthState = createSelector(getSharedState, (state) => {
    return state.isAuth;
});
export const getUserId = createSelector(getSharedState, (state) => {
    return state.userId;
});
//# sourceMappingURL=shared.selector.js.map