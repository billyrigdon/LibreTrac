package controllers

import (
	Auth "libretrac/Auth"
	Models "libretrac/Models"
	"strconv"
	"time"

	log "github.com/sirupsen/logrus"

	"github.com/gin-gonic/gin"
)

func GetUserDisorders(context *Models.CustomContext) {
	var userDisorders []Models.UserDisorder
	token := context.Request.Header.Get("Authorization")
	userId := GetUserId(token, context)


	sqlStatement := `
		SELECT 
			ud.userDisorderId,
			ud.userId,
			d.disorderName,
			d.disorderId,
			ud.diagnoseDate
		FROM user_disorders ud
		INNER JOIN disorders d on d.disorderId = ud.disorderId
		WHERE userId = $1;
		`

	rows, err := context.DB.Query(sqlStatement, userId)

	if err != nil {
		log.Error(err)
		context.JSON(500, gin.H{
			"msg": "Error running query",
		})
		context.Abort()

		return
	}

	defer rows.Close()

	for rows.Next() {
		var userDisorder Models.UserDisorder

		err = rows.Scan(&userDisorder.UserDisorderId,
			&userDisorder.UserId,
			&userDisorder.DisorderName,
			&userDisorder.DisorderId,
			&userDisorder.DiagnoseDate)

		if err = rows.Err(); err != nil {
			log.Error(err)
			context.JSON(500, gin.H{
				"msg": "Error getting disorders",
			})
			context.Abort()

			return
		}

		userDisorders = append(userDisorders, userDisorder)
	}

	context.JSON(200, userDisorders)

}

func IsDuplicateDisorder(userId int, disorderId int, context *Models.CustomContext) bool {
	sqlStatement := `
		SELECT userDisorderId
		FROM user_disorder
		WHERE userId = $1
		AND disorderId = $2;
		`

	row := context.DB.QueryRow(sqlStatement, userId, disorderId)
	userDisorderId := 0
	err := row.Scan(&userDisorderId)
	if err != nil {
		log.Error(err)
		return false
	}

	if userDisorderId != 0 {
		log.Error("Duplicate")
		return true
	}

	return false
}

func AddUserDisorder(context *Models.CustomContext) {
	var userDisorder Models.UserDisorder

	err := context.ShouldBindJSON(&userDisorder)
	if err != nil {
		log.Error(err)
		context.JSON(400, gin.H{
			"msg": "invalid json",
		})
		context.Abort()

		return
	}

	token := context.Request.Header.Get("Authorization")
	tokenUserId := GetUserId(token, context)

	if tokenUserId != userDisorder.UserId {
		context.JSON(401, gin.H{
			"msg": "Unauthorized",
		})
		context.Abort()
		return
	}

	if IsDuplicateDisorder(userDisorder.UserId, userDisorder.DisorderId, context) {
		context.JSON(400, gin.H{
			"msg": "duplicate disorder",
		})
		context.Abort()

		return
	}

	// userDrug.DateStarted = time.Now()

	sqlStatement := `
		INSERT INTO user_disorders (userId,disorderId, diagnoseDate)
		VALUES ($1,$2,$3)
		RETURNING userDisorderId;
	`
	row := context.DB.QueryRow(sqlStatement, userDisorder.UserId, userDisorder.DisorderId, time.Now())
	err = row.Scan(&userDisorder.UserDisorderId)
	if err != nil {
		log.Error(err)
		context.JSON(500, gin.H{
			"msg": "unable to insert",
		})
		context.Abort()

		return
	}
	context.JSON(200, userDisorder)
}

func RemoveUserDisorder(context *Models.CustomContext) {
	var userId int
	disorderId := context.Query("disorderId")

	token := context.Request.Header.Get("Authorization")
	email, _ := Auth.GetTokenEmail(token)


	getUserSql := `
		SELECT userId
		FROM users
		WHERE email = $1;
	`
	err := context.DB.QueryRow(getUserSql, email).Scan(&userId)
	if err != nil {
		log.Error(err)
		context.JSON(400, gin.H{
			"msg": "User not found",
		})
		context.Abort()

		return
	}

	sqlStatement := `
		DELETE FROM user_disorders
		WHERE userId = $1
		AND disorderId = $2;
	`

	_, updateErr := context.DB.Exec(sqlStatement, userId, disorderId)
	if updateErr != nil {
		log.Error(updateErr)
		context.JSON(500, gin.H{
			"msg": "Error removing disorder",
		})
		context.Abort()

		return
	}

	context.JSON(200, "DisorderId: "+disorderId+" removed for userId: "+strconv.Itoa(userId))
}

func GetStoryDisorders(storyId int, context *Models.CustomContext) []Models.UserDisorder {
	var disorders []Models.UserDisorder

	sqlStatement := `
		SELECT 
			ud.disorderId,
			d.disorderName
		FROM user_disorder ud
		LEFT JOIN disorder d
			ON d.disorderId = ud.disorderId
		LEFT JOIN stories s
			ON ud.userId = s.userId
		WHERE s.storyId = $1
		and ud.diagnoseDate <= s.date;
	`

	rows, err := context.DB.Query(sqlStatement, storyId)

	if err != nil {
		log.Error(err)
		return disorders
	}

	defer rows.Close()

	for rows.Next() {
		var disorder Models.UserDisorder

		err = rows.Scan(&disorder.DisorderId, &disorder.DisorderName)

		if err = rows.Err(); err != nil {
			log.Error(err)
			return disorders
		}

		disorders = append(disorders, disorder)
	}

	return disorders
}
