package models

import "time"

type StoryComment struct {
	CommentId       int    `json:"commentId"`
	StoryId         int    `json:"storyId"`
	UserId          int    `json:"userId"`
	ParentCommentId int    `json:"parentCommentId"`
	Content         string `json:"content"`
	DateCreated     string `json:"dateCreated"`
	UpdatedAt       time.Time `json:"updatedAt"`
	Username        string `json:"username"`
	Votes           int    `json:"votes"`
}
