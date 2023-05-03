export type StoryComment = {
	commentId: number;
	storyId: number;
	userId: number;
	parentCommentId: number;
	content: string;
	votes: number;
	dateCreated: string;
	updatedAt: string;
	username: string;
};

export type NewStoryComment = {
	storyId: number;
	userId: number;
	parentCommentId: number;
	content: string;
};

export type CommentNotification = {
	notificationId: number;
	storyId: number;
	viewed: boolean;
	parentCommentId: number;
};