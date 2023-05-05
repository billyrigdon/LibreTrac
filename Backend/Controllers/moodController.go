package controllers

import (
	Models "libretrac/Models"

	"strconv"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	log "github.com/sirupsen/logrus"
)

func GetAverageUserMood(context *Models.CustomContext) {
	var story Models.Story
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
		SELECT   
			cast(avg(s.energy) as int) as energy,
			cast(avg(s.focus) as int) as focus,
			cast(avg(s.creativity) as int) as creativity,
			cast(avg(s.irritability) as int) as irritability,
			cast(avg(s.happiness) as int) as happiness,
			cast(avg(s.anxiety) as int) as anxiety
		FROM stories s
		WHERE userId = $1 AND s.date >= NOW() - INTERVAL '7 days';
		`

	row := context.DB.QueryRow(sqlStatement, userId)

	err = row.Scan(&story.Energy,
		&story.Focus,
		&story.Creativity,
		&story.Irritability,
		&story.Happiness,
		&story.Anxiety)

	if err != nil {
		log.Error(err)
		context.JSON(500, gin.H{
			"msg": "Error getting stories",
		})
		context.Abort()
		return
	}

	context.JSON(200, story)
}

func GetAverageUserMoodForMonth(context *Models.CustomContext) {
	var story Models.Story
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
		SELECT   
			cast(avg(s.energy) as int) as energy,
			cast(avg(s.focus) as int) as focus,
			cast(avg(s.creativity) as int) as creativity,
			cast(avg(s.irritability) as int) as irritability,
			cast(avg(s.happiness) as int) as happiness,
			cast(avg(s.anxiety) as int) as anxiety
		FROM stories s
		WHERE userId = $1 AND s.date >= NOW() - INTERVAL '30 days';
		`

	row := context.DB.QueryRow(sqlStatement, userId)

	err = row.Scan(&story.Energy,
		&story.Focus,
		&story.Creativity,
		&story.Irritability,
		&story.Happiness,
		&story.Anxiety)

	if err != nil {
		log.Error(err)
		context.JSON(500, gin.H{
			"msg": "Error getting stories",
		})
		context.Abort()
		return
	}

	context.JSON(200, story)
}

func GetAverageStoryMood(context *Models.CustomContext) {
	var story Models.Story
	storyId := context.Query("storyId")


	sqlStatement := `
		SELECT   
			cast(avg(s.energy) as int) as energy,
			cast(avg(s.focus) as int) as focus,
			cast(avg(s.creativity) as int) as creativity,
			cast(avg(s.irritability) as int) as irritability,
			cast(avg(s.happiness) as int) as happiness,
			cast(avg(s.anxiety) as int) as anxiety	
		FROM stories s
		WHERE storyId = $1;
		`

	row := context.DB.QueryRow(sqlStatement, storyId)

	err := row.Scan(&story.Energy,
		&story.Focus,
		&story.Creativity,
		&story.Irritability,
		&story.Happiness,
		&story.Anxiety)

	if err != nil {
		log.Error(err)
		context.JSON(500, gin.H{
			"msg": "Error getting stories",
		})
		context.Abort()
		return
	}
	context.JSON(200, story)
}
