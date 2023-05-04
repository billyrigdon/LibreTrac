import { createReducer, on, } from '@ngrx/store';
import { toggleAuth, toggleLoading, setUserId, } from '../actions/shared.actions';
import { initialState } from '../shared.state';
export const _sharedReducer = createReducer(initialState, on(toggleLoading, (state, action) => {
    return {
        ...state,
        isLoading: action.status,
    };
}), on(toggleAuth, (state, action) => {
    return {
        ...state,
        isAuth: action.status,
    };
}), on(setUserId, (state, action) => {
    return {
        ...state,
        userId: action.userId,
    };
}));
//# sourceMappingURL=shared.reducer.js.map