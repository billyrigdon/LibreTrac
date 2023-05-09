package controllers

import (
	Models "libretrac/Models"

	log "github.com/sirupsen/logrus"

	"github.com/gin-gonic/gin"
)


func ToggleStoryVote(context *Models.CustomContext) {
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

	// Check if vote exists for the given story and user
	sqlStatement := `
		SELECT storyId FROM story_votes WHERE storyId = $1 AND userId = $2;
	`
	row := context.DB.QueryRow(sqlStatement, vote.StoryId, vote.UserId)
	err = row.Scan(&vote.StoryId)

	// If vote exists, remove it, otherwise add it
	if err == nil {
		sqlStatement = `
			DELETE FROM story_votes WHERE storyId = $1 AND userId = $2;
		`
	} else {
		sqlStatement = `
			INSERT INTO story_votes (storyId, userId) VALUES ($1, $2);
		`
	}

	_, err = context.DB.Exec(sqlStatement, vote.StoryId, vote.UserId)
	if err != nil {
		log.Error(err)
		context.JSON(400, gin.H{
			"msg":  "Unable to toggle vote",
			"vote": vote,
		})
		context.Abort()
		return
	}

	// Get all votes for the given story ID
	sqlStatement = `
		SELECT * FROM story_votes WHERE storyId = $1;
	`
	rows, err := context.DB.Query(sqlStatement, vote.StoryId)
	if err != nil {
		log.Error(err)
		context.JSON(400, gin.H{
			"msg": "Unable to get story votes",
		})
		context.Abort()
		return
	}
	defer rows.Close()

	votes := []Models.StoryVote{}
	for rows.Next() {
		var v Models.StoryVote
		if err := rows.Scan(&v.StoryId, &v.UserId); err != nil {
			log.Error(err)
			continue
		}
		votes = append(votes, v)
	}

	if err := rows.Err(); err != nil {
		log.Error(err)
		context.JSON(400, gin.H{
			"msg": "Unable to get story votes",
		})
		context.Abort()
		return
	}

	context.JSON(200, gin.H{
		"msg":   "Vote toggled",
		"vote":  vote,
		"votes": votes,
	})
}


func ToggleCommentVote(context *Models.CustomContext) {
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

	// Check if vote exists for the given comment and user
	sqlStatement := `
		SELECT commentId FROM comment_votes WHERE commentId = $1 AND userId = $2;
	`
	row := context.DB.QueryRow(sqlStatement, vote.CommentId, vote.UserId)
	err = row.Scan(&vote.CommentId)

	// If vote exists, remove it, otherwise add it
	if err == nil {
		sqlStatement = `
			DELETE FROM comment_votes WHERE commentId = $1 AND userId = $2;
		`
	} else {
		sqlStatement = `
			INSERT INTO comment_votes (commentId, userId) VALUES ($1, $2);
		`
	}

	_, err = context.DB.Exec(sqlStatement, vote.CommentId, vote.UserId)
	if err != nil {
		log.Error(err)
		context.JSON(400, gin.H{
			"msg":  "Unable to toggle vote",
			"vote": vote,
		})
		context.Abort()
		return
	}

	// Get all votes for the given comment ID
	sqlStatement = `
		SELECT * FROM comment_votes WHERE commentId = $1;
	`
	rows, err := context.DB.Query(sqlStatement, vote.CommentId)
	if err != nil {
		log.Error(err)
		context.JSON(400, gin.H{
			"msg": "Unable to get comment votes",
		})
		context.Abort()
		return
	}
	defer rows.Close()

	votes := []Models.CommentVote{}
	for rows.Next() {
		var v Models.CommentVote
		if err := rows.Scan(&v.CommentId, &v.UserId); err != nil {
			log.Error(err)
			continue
		}
		votes = append(votes, v)
	}

	if err := rows.Err(); err != nil {
		log.Error(err)
		context.JSON(400, gin.H{
			"msg": "Unable to get comment votes",
		})
		context.Abort()
		return
	}

	context.JSON(200, gin.H{
		"msg":   "Vote toggled",
		"vote":  vote,
		"votes": votes,
	})
}




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
