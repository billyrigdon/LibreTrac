package controllers

import (
	Models "libretrac/Models"
	"strconv"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	log "github.com/sirupsen/logrus"
)

func CreateNotification(comment Models.StoryComment, context *Models.CustomContext) {
	var notification Models.Notification
	var userId int
	// var parentCommentUserId int


	// First get the userId of the story
	storyUserIdSqlStatement := `
		SELECT userId FROM stories
		WHERE storyId = $1;
	`
	log.Error("comment: ", comment)
	err := context.DB.QueryRow(storyUserIdSqlStatement, comment.StoryId).Scan(&userId)

	if err != nil {
		log.Error(err)
	}

	// If the comment has a parent comment, get the userId of the parent comment instead
	if comment.ParentCommentId != 0 {
		parentCommentUserIdSqlStatement := `
			SELECT userId FROM story_comments
			WHERE commentId = $1;
		`
		err := context.DB.QueryRow(parentCommentUserIdSqlStatement, comment.ParentCommentId).Scan(&userId)

		if err != nil {
			log.Error(err)
		}
	}

	// If the userId of the story or parent comment is the same as the userId of the comment, don't create a notification
	if userId == comment.UserId {
		return
	}

	sqlStatement := `
			INSERT INTO notifications
				(storyId, parentCommentId, viewed, userId)
			VALUES
				($1, $2, $3, $4)
			RETURNING notificationId;
	`

	notieErr := context.DB.QueryRow(sqlStatement,
		comment.StoryId,
		comment.ParentCommentId,
		false,
		userId).Scan(&notification.NotificationId)

	if notieErr != nil {
		log.Error(err)
		return
	}
}

func ClearNotifications(context *Models.CustomContext) {
	storyId := context.Query("storyId")
	userId := context.Query("userId")


	sqlStatement := `
		UPDATE notifications
		SET viewed = true
		WHERE 
		storyId = $1
		AND
		userId = $2
		AND
		viewed = false;
	`

	_, err := context.DB.Exec(sqlStatement, storyId, userId)

	if err != nil {
		log.Error(err)
		context.JSON(500, gin.H{
			"msg": "Error clearing notifcations",
		})
		context.Abort()

	}

	context.JSON(200, gin.H{
		"msg": "Notifications cleared",
	})
}

func GetNotifications(context *Models.CustomContext) {
	userId := context.Query("userId")

	userIdInt, err := strconv.Atoi(userId)
	if err != nil {
		log.Error(err)
		context.JSON(400, gin.H{
			"msg": "invalid userId",
		})
		context.Abort()
		return
	}

	token := context.Request.Header.Get("Authorization")
	tokenUserId := GetUserId(token, context)

	if tokenUserId != userIdInt {
		context.JSON(401, gin.H{
			"msg": "Unauthorized",
		})
		context.Abort()
		return
	}


	sqlStatement := `
		SELECT notificationId, viewed, parentCommentId, storyId FROM notifications
		WHERE 
		userId = $1
		AND
		viewed = false;
	`

	rows, err := context.DB.Query(sqlStatement, userId)
	if err != nil {
		log.Error(err)
	}

	var notifications []Models.Notification

	for rows.Next() {
		var notification Models.Notification

		rowErr := rows.Scan(
			&notification.NotificationId,
			&notification.Viewed,
			&notification.ParentCommentId,
			&notification.StoryId,
		)

		if rowErr != nil {
			log.Error(err)
			context.JSON(500, gin.H{
				"msg": "Error getting notifications",
			})
			context.Abort()

		}

		notifications = append(notifications, notification)
	}

	context.JSON(200, notifications)
}

func GetNotificationStories(context *Models.CustomContext) {
	userId := context.Query("userId")

	userIdInt, err := strconv.Atoi(userId)
	if err != nil {
		log.Error(err)
		context.JSON(400, gin.H{
			"msg": "invalid userId",
		})
		context.Abort()
		return
	}

	token := context.Request.Header.Get("Authorization")
	tokenUserId := GetUserId(token, context)

	if tokenUserId != userIdInt {
		context.JSON(401, gin.H{
			"msg": "Unauthorized",
		})
		context.Abort()
		return
	}


	sqlStatement := `
		SELECT storyId, title from stories WHERE storyId IN
			(
			SELECT storyId FROM notifications
				WHERE 
				userID = $1
				AND
				viewed = false
			);
		`

	rows, err := context.DB.Query(sqlStatement, userId)
	if err != nil {
		context.JSON(500, gin.H{
			"msg": "Error getting stories",
		})
		context.Abort()

		return
	}

	var stories []Models.Story

	for rows.Next() {
		var story Models.Story

		rowErr := rows.Scan(
			&story.StoryId,
			&story.Title,
		)

		if rowErr != nil {
			log.Error(err)
			context.JSON(500, gin.H{
				"msg": "Error getting notification stories",
			})
			context.Abort()

		}

		stories = append(stories, story)
	}

	context.JSON(200, stories)
}
