import { _sharedReducer } from './shared/reducers/shared.reducer';
import { SHARED_STATE_NAME } from './shared/selectors/shared.selector';
import { COMMENTS_STATE_NAME } from './comments/comments.selector';
import { _commentsReducer } from './comments/comments.reducer';
export const appReducer = {
    [SHARED_STATE_NAME]: _sharedReducer,
    [COMMENTS_STATE_NAME]: _commentsReducer,
};
//# sourceMappingURL=app.state.js.map