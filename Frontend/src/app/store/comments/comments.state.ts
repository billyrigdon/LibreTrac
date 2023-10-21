import { CommentNotification, StoryComment } from "src/app/types/comment";

export interface Notification {
	notificationId: number;
	userId: number;
	viewed: boolean;
	commentId: number;
	storyId: number;
}

export interface CommentsState {
	addCommentOpen: boolean;
	parentCommentId: number;
	storyId: number;
	storyContent: string;
	parentCommentContent: string;
	notifications: CommentNotification[];
	isUserStory: boolean;
	comments: StoryComment[];
	scrollToCommentId: number;
}

export const initialState: CommentsState = {
	addCommentOpen: false,
	parentCommentId: 0,
	storyId: 0,
	storyContent: "",
	parentCommentContent: "",
	notifications: [],
	isUserStory: false,
	comments: [],
	scrollToCommentId: 0
};
