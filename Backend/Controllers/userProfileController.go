package controllers

import (
	Models "libretrac/Models"
	Utilities "libretrac/Utilities"

	log "github.com/sirupsen/logrus"

	"github.com/gin-gonic/gin"
)

func UpdateUserProfile(context *gin.Context) {
	var user Models.UserProfile

	err := context.ShouldBindJSON(&user)

	if err != nil {
		log.Error(err)
		context.JSON(400, gin.H{
			"msg": "invalid json",
		})
		context.Abort()

		return
	}

	token := context.Request.Header.Get("Authorization")
	userId := GetUserId(token)

	if userId != user.UserId {
		context.JSON(401, gin.H{
			"msg": "Unauthorized",
		})
		context.Abort()
	}

	db, dbErr := Utilities.ConnectPostgres()
	defer db.Close()

	dbErr = db.Ping()

	if dbErr != nil {
		log.Error(dbErr)
	}

	sqlStatement := `

		UPDATE user_profile
		SET covidVaccine = $1,
			smoker = $2,
			drinker = $3,
			optOutOfPublicStories = $4
		WHERE userId = $5;
	`

	_, err = db.Exec(sqlStatement, user.CovidVaccine, user.Smoker, user.Drinker, user.OptOutOfPublicStories, userId)

	if err != nil {
		log.Error(err)
		context.JSON(500, gin.H{
			"msg": "Error updating user profile",
		})
		context.Abort()

		return
	}
	context.JSON(200, user)
}

func GetUserProfile(context *gin.Context) {
	token := context.Request.Header.Get("Authorization")
	userId := GetUserId(token)
	var user Models.UserProfile

	db, dbErr := Utilities.ConnectPostgres()
	defer db.Close()

	dbErr = db.Ping()
	if dbErr != nil {
		log.Error(dbErr)
	}

	sqlStatement := `
		SELECT 
			userId,
			username,
				(SELECT count(*) 
				FROM story_votes 
				WHERE storyId 
				IN (SELECT storyId 
					WHERE userId = $1)) 				
			+
				(SELECT count(*) 
				FROM comment_votes 
				WHERE commentId 
				IN (SELECT commentId 
					FROM story_comments 
					WHERE userId = $1))	
			as reputation,
			covidVaccine,
			smoker,
			drinker,
			optOutOfPublicStories,
			notificationPermission,
			textSize
		FROM user_profile
		WHERE userId = $1;
		`

	row := db.QueryRow(sqlStatement, userId)

	err := row.Scan(&user.UserId,
		&user.Username,
		&user.Reputation,
		&user.CovidVaccine,
		&user.Smoker,
		&user.Drinker,
		&user.OptOutOfPublicStories,
		&user.NotificationPermission,
		&user.TextSize)

	if err != nil {
		log.Error(err)
		context.JSON(500, gin.H{
			"msg": "Error getting user profile",
		})
		context.Abort()

		return
	}
	context.JSON(200, user)

}

func CreateUserProfile(context *gin.Context) {
	token := context.Request.Header.Get("Authorization")
	var user Models.UserProfile

	err := context.ShouldBindJSON(&user)
	if err != nil {
		log.Error(err)
		context.JSON(400, gin.H{
			"msg": "invalid json",
		})
		context.Abort()

		return
	}

	user.UserId = GetUserId(token)

	db, dbErr := Utilities.ConnectPostgres()
	defer db.Close()

	dbErr = db.Ping()
	if dbErr != nil {
		log.Error(dbErr)
	}

	sqlStatement := `
		INSERT INTO user_profile 
		( 
			userId,
			username,
			covidVaccine,
			smoker,
			drinker,
			optOutOfPublicStories,
			notificationPermission,
			textSize
		)
		VALUES
		(
			$1,
			$2,
			$3,
			$4,
			$5,
			$6,
			$7,
			$8
		);
		`

	db.Exec(sqlStatement,
		user.UserId,
		user.Username,
		user.CovidVaccine,
		user.Smoker,
		user.Drinker,
		user.OptOutOfPublicStories,
		false,
		"16")

	context.JSON(200, user)
}
