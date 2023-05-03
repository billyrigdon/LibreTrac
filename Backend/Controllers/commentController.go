package controllers

import (
	Models "libretrac/Models"
	Utilities "libretrac/Utilities"
	"strconv"

	log "github.com/sirupsen/logrus"

	"github.com/gin-gonic/gin"
)

var REDACTED_USER_ID int = 1
var OP_USER_ID int = 2

func GetComments(context *gin.Context) {
	var comments []Models.StoryComment
	storyId := context.Query("storyId")

	db, dbErr := Utilities.ConnectPostgres()
	defer db.Close()

	dbErr = db.Ping()
	if dbErr != nil {
		log.Error(dbErr)
	}

	sqlStatement := `
		SELECT 
			sc.commentId,
			sc.storyId,
			sc.userId,
			sc.dateCreated,
			sc.updatedAt,
			u.username,
			sc.content,
			(select cast(count(*) as int) from comment_votes cv where cv.commentId = sc.commentId ) as votes,
			sc.parentCommentId
		FROM story_comments sc
		LEFT JOIN users u on u.userId = sc.userId
		WHERE sc.storyId = $1;
	`
	rows, err := db.Query(sqlStatement, storyId)

	if err != nil {
		log.Error(err)
		context.JSON(500, gin.H{
			"msg": "Error getting comments",
		})
		context.Abort()

		return
	}

	defer rows.Close()

	for rows.Next() {
		var comment Models.StoryComment

		err = rows.Scan(&comment.CommentId,
			&comment.StoryId,
			&comment.UserId,
			&comment.DateCreated,
			&comment.UpdatedAt,
			&comment.Username,
			&comment.Content,
			&comment.Votes,
			&comment.ParentCommentId)

		if err = rows.Err(); err != nil {
			log.Error(err)
			context.JSON(500, gin.H{
				"msg": "Error getting comments",
			})
			context.Abort()

			return
		}

		comments = append(comments, comment)
	}

	context.JSON(200, comments)
}

func GetCommentUserId(commentId int) int {
	var userId int

	db, dbErr := Utilities.ConnectPostgres()

	dbErr = db.Ping()

	if dbErr != nil {

		log.Error(dbErr)

	}

	sqlStatement := `
		SELECT
			sc.userId
		FROM story_comments sc
		WHERE sc.commentId = $1;
	`

	row := db.QueryRow(sqlStatement, commentId)

	err := row.Scan(&userId)

	if err != nil {
		log.Error(err)
	}

	defer db.Close()

	return userId
}

func AddComment(context *gin.Context) {
	var comment Models.StoryComment

	err := context.ShouldBindJSON(&comment)

	if err != nil {
		log.Error(err)
		context.JSON(400, gin.H{
			"msg": "invalid json",
		})
		context.Abort()

		return
	}

	if len(comment.Content) > 5000 {
		context.JSON(400, gin.H{
			"msg": "comment too long",
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

	sqlStatementNoParent := `
		INSERT INTO story_comments
			(storyId,userId,content)
		VALUES
			($1,$2,$3)
		RETURNING commentId;
	`

	sqlStatementParent := `
		INSERT INTO story_comments
			(storyId,userId,parentCommentId,content)
		VALUES
			($1,$2,$3,$4)
		RETURNING commentId;
	`

	if comment.ParentCommentId > 0 {
		err := db.QueryRow(sqlStatementParent,
			comment.StoryId,
			comment.UserId,
			comment.ParentCommentId,
			comment.Content).Scan(&comment.CommentId)

		if err != nil {
			log.Error(err)
			context.JSON(500, gin.H{
				"msg": "Couldn't create comment",
			})
			context.Abort()
			return
		}

		//Don't create notification if user is replying to their own comment or if comment is deleted
		if comment.UserId != REDACTED_USER_ID && comment.UserId != OP_USER_ID {
			CreateNotification(comment)
		}

		context.JSON(200, comment)
	} else {
		err := db.QueryRow(sqlStatementNoParent,
			comment.StoryId,
			comment.UserId,
			comment.Content).Scan(&comment.CommentId)

		if err != nil {
			log.Error(err)
			context.JSON(500, gin.H{
				"msg": "Couldn't create comment",
			})
			context.Abort()
			return
		}

		comment.ParentCommentId = 0

		if comment.UserId != REDACTED_USER_ID && comment.UserId != OP_USER_ID {
			CreateNotification(comment)
		}

		context.JSON(200, comment)
	}

}

func UpdateComment(context *gin.Context) {
	var comment Models.StoryComment

	//Get userId from token to verify that user owns the comment
	token := context.Request.Header.Get("Authorization")
	userId := GetUserId(token)
	origUserId := userId
	err := context.ShouldBindJSON(&comment)
	if err != nil {
		log.Error(err)
		context.JSON(400, gin.H{
			"msg": "invalid json",
		})
		context.Abort()

		return
	}

	// Check if user owns the story and set userId to OP_USER_ID if they do
	isUserStory := VerifyIsUserStory(strconv.Itoa(comment.StoryId), strconv.Itoa(userId))

	if isUserStory {
		userId = OP_USER_ID
	}

	// Get the comment userId to compare to the token userId or OP_USER_ID

	if comment.UserId != origUserId && (comment.UserId != OP_USER_ID && !isUserStory) {
		context.JSON(401, gin.H{
			"msg": "Unauthorized",
		})
		context.Abort()

		return
	}

	if len(comment.Content) > 1000 {
		context.JSON(400, gin.H{
			"msg": "comment too long",
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
		UPDATE story_comments
		SET content = $1, updatedAt = NOW()
		WHERE commentId = $2
		AND userId = $3
		RETURNING updatedAt;
	`

	err = db.QueryRow(sqlStatement,
		comment.Content,
		comment.CommentId,
		userId).Scan(&comment.UpdatedAt)

	if err != nil {
		log.Error(err)
		context.JSON(500, gin.H{
			"msg": "Couldn't update comment",
		})
		context.Abort()

		return
	}

	context.JSON(200, comment)
}

func DeleteComment(context *gin.Context) {
	storyId := context.Query("storyId")
	commentId := context.Query("commentId")

	//Get userId from token to verify that user is authorized to delete the comment
	token := context.Request.Header.Get("Authorization")
	origUserId := GetUserId(token)
	userId := origUserId
	// Check if user owns the story and set userId to OP_USER_ID if they do
	isUserStory := VerifyIsUserStory(storyId, strconv.Itoa(userId))

	if isUserStory {
		userId = OP_USER_ID
	}

	commentIdInt, convertErr := strconv.Atoi(commentId)

	if convertErr != nil {
		context.JSON(500, gin.H{
			"msg": "Comment not found",
		})
		context.Abort()

		return
	}

	// Get the comment userId to compare to the token userId or OP_USER_ID
	commentUserId := GetCommentUserId(commentIdInt)

	if commentUserId != origUserId && (commentUserId != OP_USER_ID && !isUserStory) {
		context.JSON(401, gin.H{
			"msg": "Unauthorized",
		})
		context.Abort()

		return
	}

	// Redact comment
	db, dbErr := Utilities.ConnectPostgres()
	defer db.Close()

	dbErr = db.Ping()
	if dbErr != nil {
		log.Error(dbErr)
	}

	sqlStatement := `
		UPDATE story_comments
		SET content = '[ redacted ]',userId = 1
		WHERE commentId = $1
		AND (userId = $2
		OR userId = $3);
	`

	_, deleteErr := db.Exec(sqlStatement, commentId, origUserId, userId)
	if deleteErr != nil {
		log.Error(deleteErr)
		context.JSON(500, gin.H{
			"msg": "Error deleting comment",
		})
		context.Abort()

		return
	}

	context.JSON(200, commentId+" deleted successfully")
}
