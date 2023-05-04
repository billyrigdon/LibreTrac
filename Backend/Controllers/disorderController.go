package controllers

import (
	Models "libretrac/Models"
	Utilities "libretrac/Utilities"

	log "github.com/sirupsen/logrus"

	"github.com/gin-gonic/gin"
)

func GetAllDisorders(context *gin.Context) {

	var disorders []Models.Disorder

	db, dbErr := Utilities.ConnectPostgres()
	defer db.Close()

	dbErr = db.Ping()
	if dbErr != nil {
		log.Error(dbErr)
	}

	sqlStatement := `
		SELECT disorderId,disorderName
		FROM disorders
		ORDER BY disorderName;
	`

	rows, err := db.Query(sqlStatement)

	if err != nil {
		log.Error(err)
		context.JSON(500, gin.H{
			"msg": "Error getting disorders",
		})
		context.Abort()

		return
	}

	defer rows.Close()

	for rows.Next() {
		var disorder Models.Disorder

		err = rows.Scan(&disorder.DisorderId, &disorder.DisorderName)

		if err = rows.Err(); err != nil {
			log.Error(err)
			context.JSON(500, gin.H{
				"msg": "Error getting disorders",
			})
			context.Abort()

			return
		}

		disorders = append(disorders, disorder)
	}

	context.JSON(200, disorders)
}

// Requires ?disorderId= , returns disorder name and id
func GetDisorder(context *gin.Context) {
	var disorder Models.Disorder
	disorderId := context.Query("disorderId")

	db, dbErr := Utilities.ConnectPostgres()
	defer db.Close()

	dbErr = db.Ping()
	if dbErr != nil {
		log.Error(dbErr)
	}

	sqlStatement := `
		SELECT disorderid,disordername
		FROM disorders
		WHERE disorderid = $1;
	`
	err := db.QueryRow(sqlStatement, disorderId).Scan(&disorder.DisorderId, &disorder.DisorderName)
	if err != nil {
		log.Error(err)
		context.JSON(400, gin.H{
			"msg": "disorder not found",
		})
		context.Abort()

		return
	}
	context.JSON(200, disorder)
}

// requires "name" json object,inserts into database, and returns generated disorderId
func AddDisorder(context *gin.Context) {
	var disorder Models.Disorder

	disorderId := context.Query("disorderId")

	db, dbErr := Utilities.ConnectPostgres()
	defer db.Close()

	dbErr = db.Ping()
	if dbErr != nil {
		log.Error(dbErr)
	}

	sqlStatement := `
		SELECT disorderId,disorderName
		FROM disorders
		WHERE disorderId = $1;
	`
	err := db.QueryRow(sqlStatement, disorderId).Scan(&disorder.DisorderId, &disorder.DisorderName)
	if err != nil {
		log.Error(err)
		return
	}

	err = context.ShouldBindJSON(&disorder)
	if err != nil {
		log.Error(err)
		context.JSON(400, gin.H{
			"msg": "invalid json",
		})
		context.Abort()

		return
	}


	sqlStatement = `
		INSERT INTO disorders
			(disorderName) 
		VALUES
			($1)
		RETURNING disorderId;
	`
	err = db.QueryRow(sqlStatement, disorder.DisorderName).Scan(&disorder.DisorderId)
	if err != nil {
		log.Error(err)
		context.JSON(400, gin.H{
			"msg": " Couldn't add disorder",
		})
		context.Abort()

		return
	}

	context.JSON(200, disorder)

}
