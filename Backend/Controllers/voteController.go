package controllers

import (
	Models "libretrac/Models"
	Utilities "libretrac/Utilities"

	log "github.com/sirupsen/logrus"

	"github.com/gin-gonic/gin"
)

func AddStoryVote(context *gin.Context) {
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

	db, dbErr := Utilities.ConnectPostgres()
	defer db.Close()

	dbErr = db.Ping()
	if dbErr != nil {
		log.Error(dbErr)
	}

	sqlStatement := `
		INSERT INTO story_votes
			(storyId,userId) 
		VALUES
			($1,$2)
		RETURNING storyId;
	`
	err = db.QueryRow(sqlStatement, vote.StoryId, vote.UserId).Scan(&vote.StoryId)
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

func RemoveStoryVote(context *gin.Context) {
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

	db, dbErr := Utilities.ConnectPostgres()
	defer db.Close()

	dbErr = db.Ping()
	if dbErr != nil {
		log.Error(dbErr)
	}

	sqlStatement := `
		DELETE FROM story_votes
		WHERE storyId = $1
		AND userId = $2;
		`

	_, err = db.Exec(sqlStatement, vote.StoryId, vote.UserId)
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

func AddCommentVote(context *gin.Context) {
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

	db, dbErr := Utilities.ConnectPostgres()
	defer db.Close()

	dbErr = db.Ping()
	if dbErr != nil {
		log.Error(dbErr)
	}

	sqlStatement := `
		INSERT INTO comment_votes
			(commentId,userId) 
		VALUES
			($1,$2);
	`
	_, err = db.Exec(sqlStatement, vote.CommentId, vote.UserId)
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

func RemoveCommentVote(context *gin.Context) {
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

	db, dbErr := Utilities.ConnectPostgres()
	defer db.Close()

	dbErr = db.Ping()
	if dbErr != nil {
		log.Error(dbErr)
	}

	sqlStatement := `
		DELETE FROM comment_votes
		WHERE commentId = $1
		AND userId = $2;
		`

	_, err = db.Exec(sqlStatement, vote.CommentId, vote.UserId)
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
