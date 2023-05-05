package controllers

import (
	Auth "libretrac/Auth"
	Models "libretrac/Models"
	"strconv"
	"time"

	log "github.com/sirupsen/logrus"

	"github.com/gin-gonic/gin"
)

func GetUserDrugs(context *Models.CustomContext) {
	var userDrugs []Models.UserDrug
	token := context.Request.Header.Get("Authorization")
	userId := GetUserId(token, context)



	sqlStatement := `
		SELECT 
			ud.userDrugId,
			ud.userId,
			d.name,
			ud.dosage,
			ud.drugId,
			ud.dateStarted,
			ud.dateEnded
		FROM user_drugs ud
		INNER JOIN drugs d on d.drugId = ud.drugId
		WHERE userId = $1
		AND dateEnded IS NULL;
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
		var userDrug Models.UserDrug

		err = rows.Scan(&userDrug.UserDrugId,
			&userDrug.UserId,
			&userDrug.DrugName,
			&userDrug.Dosage,
			&userDrug.DrugId,
			&userDrug.DateStarted,
			&userDrug.DateEnded)

		if err = rows.Err(); err != nil {
			log.Error(err)
			context.JSON(500, gin.H{
				"msg": "Error getting drugs",
			})
			context.Abort()

			return
		}

		userDrugs = append(userDrugs, userDrug)
	}

	context.JSON(200, userDrugs)

}

func IsDuplicateDrug(userId int, drugId int, context *Models.CustomContext) bool {
	sqlStatement := `
		SELECT userDrugId
		FROM user_drugs
		WHERE userId = $1
		AND drugId = $2
		AND dateEnded IS NULL;
		`

	row := context.DB.QueryRow(sqlStatement, userId, drugId)
	userDrugId := 0
	err := row.Scan(&userDrugId)
	if err != nil {
		log.Error(err)
		return false
	}

	if userDrugId != 0 {
		log.Error("Duplicate")
		return true
	}

	return false
}

func AddUserDrug(context *Models.CustomContext) {
	var userDrug Models.UserDrug

	err := context.ShouldBindJSON(&userDrug)

	token := context.Request.Header.Get("Authorization")
	tokenUserId := GetUserId(token, context)

	if tokenUserId != userDrug.UserId {
		context.JSON(401, gin.H{
			"msg": "Unauthorized",
		})
		context.Abort()
		return
	}

	if err != nil {
		log.Error(err)
		context.JSON(400, gin.H{
			"msg": "invalid json",
		})
		context.Abort()

		return
	}

	if len(userDrug.Dosage) > 25 {
		context.JSON(400, gin.H{
			"msg": "dosage too long",
		})
		context.Abort()
		return
	}

	if IsDuplicateDrug(userDrug.UserId, userDrug.DrugId, context) {
		context.JSON(400, gin.H{
			"msg": "duplicate drug",
		})
		context.Abort()

		return
	}

	userDrug.DateStarted = time.Now()


	sqlStatement := `
		INSERT INTO user_drugs (userId,drugId,dosage,dateStarted)
		VALUES ($1,$2,$3,$4)
		RETURNING userDrugId;
	`
	row := context.DB.QueryRow(sqlStatement, userDrug.UserId, userDrug.DrugId, userDrug.Dosage, userDrug.DateStarted)
	err = row.Scan(&userDrug.UserDrugId)
	if err != nil {
		log.Error(err)
		context.JSON(500, gin.H{
			"msg": "unable to insert",
		})
		context.Abort()

		return
	}
	context.JSON(200, userDrug)
}

func RemoveUserDrug(context *Models.CustomContext) {
	var userId int
	drugId := context.Query("drugId")
	dateEnded := time.Now()

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
		UPDATE user_drugs
		SET dateEnded = $1
		WHERE userId = $2
		AND drugId = $3
		AND dateEnded IS NULL;
	`

	_, updateErr := context.DB.Exec(sqlStatement, dateEnded, userId, drugId)
	if updateErr != nil {
		log.Error(updateErr)
		context.JSON(500, gin.H{
			"msg": "Error removing drug",
		})
		context.Abort()

		return
	}

	context.JSON(200, "DrugId: "+drugId+" removed for userId: "+strconv.Itoa(userId))
}

func GetStoryDrugs(storyId int, context *Models.CustomContext) []Models.UserDrug {
	var drugs []Models.UserDrug

	sqlStatement := `
		SELECT 
			ud.drugId,
			ud.dosage,
			d.name
		FROM user_drugs ud
		LEFT JOIN drugs d
			ON d.drugId = ud.drugId
		LEFT JOIN stories s
			ON ud.userId = s.userId
		WHERE s.storyId = $1
		AND (ud.dateEnded > s.date OR ud.dateEnded IS NULL)
		and ud.dateStarted <= s.date;
	`

	rows, err := context.DB.Query(sqlStatement, storyId)

	if err != nil {
		log.Error(err)
		return drugs
	}

	defer rows.Close()

	for rows.Next() {
		var drug Models.UserDrug

		err = rows.Scan(&drug.DrugId, &drug.Dosage, &drug.DrugName)

		if err = rows.Err(); err != nil {
			log.Error(err)
			return drugs
		}

		drugs = append(drugs, drug)
	}

	return drugs
}

func UpdateUserDrug(context *Models.CustomContext) {
	var userDrug Models.UserDrug

	err := context.ShouldBindJSON(&userDrug)

	token := context.Request.Header.Get("Authorization")
	tokenUserId := GetUserId(token, context)

	if tokenUserId != userDrug.UserId {
		context.JSON(401, gin.H{
			"msg": "Unauthorized",
		})
		context.Abort()
		return
	}

	if err != nil {
		log.Error(err)
		context.JSON(400, gin.H{
			"msg": "invalid json",
		})
		context.Abort()

		return
	}

	if len(userDrug.Dosage) > 25 {
		context.JSON(400, gin.H{
			"msg": "dosage too long",
		})
		context.Abort()
		return
	}


	sqlStatement := `
		UPDATE user_drugs set dosage = $1, drugId = $2
		WHERE userDrugId = $3
		RETURNING userDrugId;
	`
	row := context.DB.QueryRow(sqlStatement, userDrug.Dosage, userDrug.DrugId, userDrug.UserDrugId)
	err = row.Scan(&userDrug.UserDrugId)
	if err != nil {
		log.Error(err)
		context.JSON(500, gin.H{
			"msg": "unable to update",
		})
		context.Abort()

		return
	}
	context.JSON(200, userDrug)
}
