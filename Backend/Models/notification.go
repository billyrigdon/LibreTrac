package models

type Notification struct {
	NotificationId  int  `json:"notificationId"`
	StoryId         int  `json:"storyId"`
	ParentCommentId int  `json:"parentCommentId"`
	Viewed          bool `json:"viewed"`
}
