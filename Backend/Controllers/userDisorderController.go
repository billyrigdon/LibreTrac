package controllers

import (
	Auth "libretrac/Auth"
	Models "libretrac/Models"
	Utilities "libretrac/Utilities"
	"strconv"
	"time"

	log "github.com/sirupsen/logrus"

	"github.com/gin-gonic/gin"
)

func GetUserDisorders(context *gin.Context) {
	var userDisorders []Models.UserDisorder
	token := context.Request.Header.Get("Authorization")
	userId := GetUserId(token)

	

	db, dbErr := Utilities.ConnectPostgres()
	defer db.Close()

	dbErr = db.Ping()
	if dbErr != nil {
		log.Error(dbErr)
	}

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

	rows, err := db.Query(sqlStatement, userId)

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

func IsDuplicateDisorder(userId int, disorderId int) bool {
	db, dbErr := Utilities.ConnectPostgres()
	defer db.Close()

	dbErr = db.Ping()
	if dbErr != nil {
		log.Error(dbErr)
	}

	sqlStatement := `
		SELECT userDisorderId
		FROM user_disorder
		WHERE userId = $1
		AND disorderId = $2;
		`

	row := db.QueryRow(sqlStatement, userId, disorderId)
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

func AddUserDisorder(context *gin.Context) {
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
	tokenUserId := GetUserId(token)

	if tokenUserId != userDisorder.UserId {
		context.JSON(401, gin.H{
			"msg": "Unauthorized",
		})
		context.Abort()
		return
	}

	if IsDuplicateDisorder(userDisorder.UserId, userDisorder.DisorderId) {
		context.JSON(400, gin.H{
			"msg": "duplicate disorder",
		})
		context.Abort()

		return
	}

	// userDrug.DateStarted = time.Now()

	db, dbErr := Utilities.ConnectPostgres()
	defer db.Close()

	dbErr = db.Ping()
	if dbErr != nil {
		log.Error(dbErr)
	}

	sqlStatement := `
		INSERT INTO user_disorders (userId,disorderId, diagnoseDate)
		VALUES ($1,$2,$3)
		RETURNING userDisorderId;
	`
	row := db.QueryRow(sqlStatement, userDisorder.UserId, userDisorder.DisorderId, time.Now())
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

func RemoveUserDisorder(context *gin.Context) {
	var userId int
	disorderId := context.Query("disorderId")

	token := context.Request.Header.Get("Authorization")
	email, _ := Auth.GetTokenEmail(token)

	db, dbErr := Utilities.ConnectPostgres()
	defer db.Close()

	dbErr = db.Ping()
	if dbErr != nil {
		log.Error(dbErr)
		return
	}

	getUserSql := `
		SELECT userId
		FROM users
		WHERE email = $1;
	`
	err := db.QueryRow(getUserSql, email).Scan(&userId)
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

	_, updateErr := db.Exec(sqlStatement, userId, disorderId)
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

func GetStoryDisorders(storyId int) []Models.UserDisorder {
	var disorders []Models.UserDisorder

	db, dbErr := Utilities.ConnectPostgres()
	defer db.Close()

	dbErr = db.Ping()
	if dbErr != nil {
		log.Error(dbErr)
	}

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

	rows, err := db.Query(sqlStatement, storyId)

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
