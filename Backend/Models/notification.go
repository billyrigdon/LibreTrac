package models

type Notification struct {
	NotificationId  int  `json:"notificationId"`
	StoryId         int  `json:"storyId"`
	ParentCommentId int  `json:"parentCommentId"`
	Viewed          bool `json:"viewed"`
	CommentId       int  `json:"commentId"`
}

type NotificationStory struct {
	NotificationId  int    `json:"notificationId"`
	StoryId         int    `json:"storyId"`
	Title		   string `json:"title"`
	ParentCommentId int    `json:"parentCommentId"`
	Viewed          bool   `json:"viewed"`
	CommentId       int    `json:"commentId"`
	Content         string `json:"content"`
}
