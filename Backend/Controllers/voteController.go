package controllers

import (
	Models "libretrac/Models"

	log "github.com/sirupsen/logrus"

	"github.com/gin-gonic/gin"
)

func AddStoryVote(context *Models.CustomContext) {
	var vote Models.StoryVote

	err := context.ShouldBindJSON(&vote)

	if err != nil {
		log.Error(err)
		context.JSON(400, gin.H{
			"msg": "invalid json",
		})
		context.Abort()

		return
	}


	sqlStatement := `
		INSERT INTO story_votes
			(storyId,userId) 
		VALUES
			($1,$2)
		RETURNING storyId;
	`
	err = context.DB.QueryRow(sqlStatement, vote.StoryId, vote.UserId).Scan(&vote.StoryId)
	if err != nil {
		log.Error(err)
		context.JSON(400, gin.H{
			"msg":  "Unable to upvote",
			"vote": vote,
		})
		context.Abort()

		return
	}

	context.JSON(200, vote)
}

func RemoveStoryVote(context *Models.CustomContext) {
	var vote Models.StoryVote

	err := context.ShouldBindJSON(&vote)
	if err != nil {
		log.Error(err)
		context.JSON(400, gin.H{
			"msg": "invalid json",
		})
		context.Abort()

		return
	}



	sqlStatement := `
		DELETE FROM story_votes
		WHERE storyId = $1
		AND userId = $2;
		`

	_, err = context.DB.Exec(sqlStatement, vote.StoryId, vote.UserId)
	if err != nil {
		log.Error(err)
		context.JSON(400, gin.H{
			"msg": "Unable to remove vote",
		})
		context.Abort()

		return
	}

	context.JSON(200, vote)
}

func AddCommentVote(context *Models.CustomContext) {
	var vote Models.CommentVote
	err := context.ShouldBindJSON(&vote)
	if err != nil {
		log.Error(err)
		context.JSON(400, gin.H{
			"msg": "invalid json",
		})
		context.Abort()

		return
	}


	sqlStatement := `
		INSERT INTO comment_votes
			(commentId,userId) 
		VALUES
			($1,$2);
	`
	_, err = context.DB.Exec(sqlStatement, vote.CommentId, vote.UserId)
	if err != nil {
		log.Error(err)
		context.JSON(400, gin.H{
			"msg": "Unable to upvote",
		})
		context.Abort()

		return
	}

	context.JSON(200, vote)
}

func RemoveCommentVote(context *Models.CustomContext) {
	var vote Models.CommentVote

	err := context.ShouldBindJSON(&vote)
	if err != nil {
		log.Error(err)
		context.JSON(400, gin.H{
			"msg": "invalid json",
		})
		context.Abort()

		return
	}


	sqlStatement := `
		DELETE FROM comment_votes
		WHERE commentId = $1
		AND userId = $2;
		`

	_, err = context.DB.Exec(sqlStatement, vote.CommentId, vote.UserId)
	if err != nil {
		log.Error(err)
		context.JSON(400, gin.H{
			"msg": "Unable to remove vote",
		})
		context.Abort()

		return
	}

	context.JSON(200, vote)
}
