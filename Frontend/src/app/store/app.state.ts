import { _sharedReducer } from './shared/reducers/shared.reducer';
import { SHARED_STATE_NAME } from './shared/selectors/shared.selector';
import { SharedState } from './shared/shared.state';
import { CommentsState } from './comments/comments.state';
import { COMMENTS_STATE_NAME } from './comments/comments.selector';
import { _commentsReducer } from './comments/comments.reducer';

export interface AppState {
	[SHARED_STATE_NAME]: SharedState;
	[COMMENTS_STATE_NAME]: CommentsState;
}

export const appReducer = {
	[SHARED_STATE_NAME]: _sharedReducer,
	[COMMENTS_STATE_NAME]: _commentsReducer,
};
