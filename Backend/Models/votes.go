package models

type CommentVote struct {
	CommentId int `json:"commentId"`
	UserId    int `json:"userId"`
}

type StoryVote struct {
	StoryId int `json:"storyId"`
	UserId  int `json:"userId"`
}
