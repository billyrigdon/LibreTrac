package controllers

import (
	Models "libretrac/Models"
	Utilities "libretrac/Utilities"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	log "github.com/sirupsen/logrus"
)

func VerifyIsUserStory(storyId string, userId string) bool {
	db, dbErr := Utilities.ConnectPostgres()
	defer db.Close()

	dbErr = db.Ping()
	if dbErr != nil {
		log.Error(dbErr)
	}

	sqlStatement := `
		SELECT storyId
		FROM stories
		WHERE storyId = $1 AND userId = $2
	`

	var id int
	err := db.QueryRow(sqlStatement, storyId, userId).Scan(&id)

	if err != nil {
		log.Error(err)
		return false
	}

	return true
}

func IsUserStory(context *gin.Context) {
	userId := context.Query("userId")
	storyId := context.Query("storyId")

	result := VerifyIsUserStory(storyId, userId)

	context.JSON(200, gin.H{"result": result})
}

// Requires json object containing fields for user struct
func CreateStory(context *gin.Context) {

	var story Models.Story
	var storyId int

	err := context.ShouldBindJSON(&story)
	if err != nil {
		log.Error(err)
		context.JSON(400, gin.H{
			"msg": "invalid json",
		})
		context.Abort()

		return
	}

	if len(story.Journal) > 5000 || len(story.Title) > 5000 {
		context.JSON(400, gin.H{
			"msg": "comment too long",
		})
		context.Abort()
		return
	}

	//Timestamp in postgres format
	story.Date = time.Now()

	db, dbErr := Utilities.ConnectPostgres()
	defer db.Close()

	dbErr = db.Ping()
	if dbErr != nil {
		log.Error(dbErr)
	}

	//Insert into database and add storyId to story object
	sqlStatement := `
		INSERT INTO stories (
			userid,
			title,
			energy,
			focus,
			creativity,
			irritability,
			happiness,
			anxiety,
			journal,
			date
		)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING storyId;
		`

	err = db.QueryRow(sqlStatement,
		story.UserId,
		story.Title,
		story.Energy,
		story.Focus,
		story.Creativity,
		story.Irritability,
		story.Happiness,
		story.Anxiety,
		story.Journal,
		story.Date).Scan(&storyId)

	if err != nil {
		log.Error(err)
		context.JSON(500, gin.H{
			"msg": "couldn't create story",
		})
		context.Abort()

		return
	}

	story.StoryId = storyId

	//Return created story including id and timestamp
	context.JSON(200, story)

	return

}

// Requires ?userId=, returns array of story Json objects
func GetUserStories(context *gin.Context) {

	var stories []Models.StoryDrugs
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
	tokenUserId := GetUserId(token)

	if tokenUserId != userIdInt {
		context.JSON(401, gin.H{
			"msg": "Unauthorized",
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
		SELECT s.storyId,
		s.title, 
		s.date,
		(select cast(count(*) as int) from story_votes sv where sv.storyId = s.storyId ) as votes
		FROM stories s
		WHERE userid = $1
		ORDER BY date DESC;
		`

	rows, err := db.Query(sqlStatement, userId)

	if err != nil {
		log.Error(err)
		context.JSON(500, gin.H{
			"msg": "Error getting stories",
		})
		context.Abort()

		return
	}

	defer rows.Close()

	for rows.Next() {
		var story Models.StoryDrugs

		err = rows.Scan(&story.StoryId,
			&story.Title,
			&story.Date,
			&story.Votes)

		if err = rows.Err(); err != nil {
			log.Error(err)
			context.JSON(500, gin.H{
				"msg": "Error getting stories",
			})
			context.Abort()

			return
		}

		story.Drugs = GetStoryDrugs(story.StoryId)

		stories = append(stories, story)
	}

	context.JSON(200, stories)

}

// Requires ?=storyId, returns story Json object
func GetSingleStory(context *gin.Context) {
	var story Models.StoryDrugs
	storyId := context.Query("storyId")

	db, dbErr := Utilities.ConnectPostgres()
	defer db.Close()

	dbErr = db.Ping()
	if dbErr != nil {
		log.Error(dbErr)
	}

	sqlStatement := `
		SELECT s.storyId, 
		s.title,
		s.energy,
		s.focus,
		s.creativity,
		s.irritability,
		s.happiness,
		s.anxiety,
		s.journal,
		s.date,
		(select cast(count(*) as int) from story_votes sv where sv.storyId = s.storyId ) as votes
		FROM stories s
		WHERE storyId = $1;
		`

	row := db.QueryRow(sqlStatement, storyId)

	err := row.Scan(&story.StoryId,
		&story.Title,
		&story.Energy,
		&story.Focus,
		&story.Creativity,
		&story.Irritability,
		&story.Happiness,
		&story.Anxiety,
		&story.Journal,
		&story.Date,
		&story.Votes)

	if err != nil {
		log.Error(err)
		context.JSON(500, gin.H{
			"msg": "Error getting stories",
		})
		context.Abort()

		return
	}

	story.Drugs = GetStoryDrugs(story.StoryId)

	context.JSON(200, story)
}

// Requires storyId?=, deletes storyId in Postgres, and returns success message
func DeleteStory(context *gin.Context) {
	storyId := context.Query("storyId")
	//Get userId from token to verify that user owns the story
	token := context.Request.Header.Get("Authorization")
	userId := GetUserId(token)

	db, dbErr := Utilities.ConnectPostgres()
	defer db.Close()

	dbErr = db.Ping()
	if dbErr != nil {
		log.Error(dbErr)
	}

	sqlStatement := `
		UPDATE stories
		SET userId = 1, journal = '[redacted]'
		WHERE storyId = $1
		AND userId = $2;
	`
	_, deleteErr := db.Exec(sqlStatement, storyId, userId)
	if deleteErr != nil {
		log.Error(deleteErr)
		context.JSON(500, gin.H{
			"msg": "Error deleting story",
		})
		context.Abort()

		return
	}

	context.JSON(200, storyId+" deleted successfully")

}

func GetAllStories(context *gin.Context) {
	var storyDrugs []Models.StoryDrugs
	drugX := context.Query("drugX")
	drugY := context.Query("drugY")

	pageNumber := context.Query("page")

	db, dbErr := Utilities.ConnectPostgres()
	defer db.Close()
	dbErr = db.Ping()
	if dbErr != nil {
		log.Error(dbErr)
	}

	// If no drugs are specified, return all stories
	if drugX == "" && drugY == "" {
		sqlStatement := `
			SELECT s.storyId, 
			s.title, 
			s.date,
			(select cast(count(*) as int) from story_votes sv where sv.storyId = s.storyId ) as votes
			FROM stories s
				left join user_profile u on s.userId = u.userId
			WHERE s.userId != 0
			AND u.optOutOfPublicStories = false
			ORDER BY s.date DESC,votes DESC
			LIMIT 10
			OFFSET $1;
			`

		rows, err := db.Query(sqlStatement, pageNumber)

		if err != nil {
			log.Error(err)
			context.JSON(500, gin.H{
				"msg": "Error getting stories",
			})
			context.Abort()

			return
		}

		defer rows.Close()

		for rows.Next() {

			var storyDrug Models.StoryDrugs

			err = rows.Scan(&storyDrug.StoryId,
				&storyDrug.Title,
				&storyDrug.Date,
				&storyDrug.Votes)

			if err = rows.Err(); err != nil {
				log.Error(err)
				context.JSON(500, gin.H{
					"msg": "Error getting stories",
				})
				context.Abort()

				return
			}

			storyDrug.Drugs = GetStoryDrugs(storyDrug.StoryId)

			storyDrugs = append(storyDrugs, storyDrug)
		}

		context.JSON(200, storyDrugs)
		// If one drug provided, return all stories with that drug
	} else if drugX != "" && drugY == "" {
		sqlStatement := `
		SELECT s.storyId,
		s.title,
		s.date,
		(select cast(count(*) as int) from story_votes sv where sv.storyId = s.storyId ) as votes
	 	FROM stories s
	 		LEFT JOIN user_profile u ON s.userId = u.userId
	 	WHERE s.userId != 0
			AND u.optOutOfPublicStories = false
			AND s.storyId IN (
		 		SELECT s1.storyId
		 		FROM stories s1
		 			LEFT JOIN user_drugs ud ON s1.userId = ud.userId
		 		WHERE ud.drugId = $1
		  			AND s1.date >= ud.dateStarted
		   			AND ((s1.date <= ud.dateEnded) OR (ud.dateEnded IS NULL))
				)
	 	ORDER BY s.date DESC, votes DESC
	 	LIMIT 10
	 	OFFSET $2;
			`

		rows, err := db.Query(sqlStatement, drugX, pageNumber)

		if err != nil {
			log.Error(err)
			context.JSON(500, gin.H{
				"msg": "Error getting stories",
			})
			context.Abort()

			return
		}

		defer rows.Close()

		for rows.Next() {

			var storyDrug Models.StoryDrugs

			err = rows.Scan(&storyDrug.StoryId,
				&storyDrug.Title,
				&storyDrug.Date,
				&storyDrug.Votes)

			if err = rows.Err(); err != nil {
				log.Error(err)
				context.JSON(500, gin.H{
					"msg": "Error getting stories",
				})
				context.Abort()

				return
			}

			storyDrug.Drugs = GetStoryDrugs(storyDrug.StoryId)

			storyDrugs = append(storyDrugs, storyDrug)
		}

		context.JSON(200, storyDrugs)

		// Get all stories with drugX

		// If two drugs provided, return all stories with both drugs
	} else if drugX != "" && drugY != "" {
		sqlStatement := `
		SELECT s.storyId,
		s.title,
		s.date,
		(select cast(count(*) as int) from story_votes sv where sv.storyId = s.storyId ) as votes
	 	FROM stories s
	 		LEFT JOIN user_profile u ON s.userId = u.userId
	 	WHERE s.userId != 0
			AND u.optOutOfPublicStories = false
			AND s.storyId IN (
		 		SELECT s1.storyId
		 		FROM stories s1
		 			LEFT JOIN user_drugs ud ON s1.userId = ud.userId
		 		WHERE ud.drugId in ($1,$2)
		  			AND s1.date >= ud.dateStarted
		   			AND ((s1.date <= ud.dateEnded) OR (ud.dateEnded IS NULL))
				)
	 	ORDER BY s.date DESC, votes DESC
	 	LIMIT 10
	 	OFFSET $3;
			`

		rows, err := db.Query(sqlStatement, drugX, drugY, pageNumber)

		if err != nil {
			log.Error(err)
			context.JSON(500, gin.H{
				"msg": "Error getting stories",
			})
			context.Abort()

			return
		}

		defer rows.Close()

		for rows.Next() {

			var storyDrug Models.StoryDrugs

			err = rows.Scan(&storyDrug.StoryId,
				&storyDrug.Title,
				&storyDrug.Date,
				&storyDrug.Votes)

			if err = rows.Err(); err != nil {
				log.Error(err)
				context.JSON(500, gin.H{
					"msg": "Error getting stories",
				})
				context.Abort()

				return
			}

			storyDrug.Drugs = GetStoryDrugs(storyDrug.StoryId)

			storyDrugs = append(storyDrugs, storyDrug)
		}

		context.JSON(200, storyDrugs)
	} else {
		context.JSON(200, gin.H{
			"msg": "Error getting stories",
		})
		context.Abort()

		return
	}
}

func UpdateStory(context *gin.Context) {
	var story Models.Story

	//Get userId from token to verify that user owns the comment
	token := context.Request.Header.Get("Authorization")
	userId := GetUserId(token)
	err := context.ShouldBindJSON(&story)
	if err != nil {
		log.Error(err)
		context.JSON(400, gin.H{
			"msg": "invalid json",
		})
		context.Abort()

		return
	}

	// Check if user owns the story and set userId to OP_USER_ID if they do
	isUserStory := VerifyIsUserStory(strconv.Itoa(story.StoryId), strconv.Itoa(userId))

	// Get the comment userId to compare to the token userId or OP_USER_ID

	if !isUserStory {
		context.JSON(401, gin.H{
			"msg": "Unauthorized",
		})
		context.Abort()

		return
	}

	if len(story.Journal) > 1000 || len(story.Title) > 100 {
		context.JSON(400, gin.H{
			"msg": "story too long",
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
		UPDATE stories
		SET title = $1, journal = $2
		WHERE storyId = $3
		AND userId = $4
		RETURNING storyId;
	`

	err = db.QueryRow(sqlStatement,
		story.Title,
		story.Journal,
		story.StoryId,
		userId).Scan(&story.StoryId)

	if err != nil {
		log.Error(err)
		context.JSON(500, gin.H{
			"msg": "Couldn't update story",
		})
		context.Abort()

		return
	}

	context.JSON(200, story)
}