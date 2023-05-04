package controllers

import (
	Models "libretrac/Models"
	Utilities "libretrac/Utilities"

	log "github.com/sirupsen/logrus"

	"github.com/gin-gonic/gin"
)

func GetAllDrugs(context *gin.Context) {

	var drugs []Models.Drug

	db, dbErr := Utilities.ConnectPostgres()
	defer db.Close()

	dbErr = db.Ping()
	if dbErr != nil {
		log.Error(dbErr)
	}

	sqlStatement := `
		SELECT drugid,name
		FROM drugs
		ORDER BY name;
	`

	rows, err := db.Query(sqlStatement)

	if err != nil {
		log.Error(err)
		context.JSON(500, gin.H{
			"msg": "Error getting drugs",
		})
		context.Abort()

		return
	}

	defer rows.Close()

	for rows.Next() {
		var drug Models.Drug

		err = rows.Scan(&drug.DrugId, &drug.Name)

		if err = rows.Err(); err != nil {
			log.Error(err)
			context.JSON(500, gin.H{
				"msg": "Error getting drugs",
			})
			context.Abort()

			return
		}

		drugs = append(drugs, drug)
	}

	context.JSON(200, drugs)
}

// Requires ?drugId= , returns drug name and id
func GetDrug(context *gin.Context) {
	var drug Models.Drug
	drugId := context.Query("drugId")

	db, dbErr := Utilities.ConnectPostgres()
	defer db.Close()

	dbErr = db.Ping()
	if dbErr != nil {
		log.Error(dbErr)
	}

	sqlStatement := `
		SELECT drugid,name
		FROM drugs
		WHERE drugid = $1;
	`
	err := db.QueryRow(sqlStatement, drugId).Scan(&drug.DrugId, &drug.Name)
	if err != nil {
		log.Error(err)
		context.JSON(400, gin.H{
			"msg": "drug not found",
		})
		context.Abort()

		return
	}
	context.JSON(200, drug)
}

// requires "name" json object,inserts into database, and returns generated drugId
func AddDrug(context *gin.Context) {
	var drug Models.Drug

	// drugId := context.Query("drugId")

	db, dbErr := Utilities.ConnectPostgres()
	defer db.Close()

	dbErr = db.Ping()
	if dbErr != nil {
		log.Error(dbErr)
	}

	// sqlStatement := `
	// 	SELECT drugid,name
	// 	FROM drugs
	// 	WHERE drugid = $1;
	// `
	// err := db.QueryRow(sqlStatement, drugId).Scan(&drug.DrugId, &drug.Name)
	// if err != nil {
	// 	log.Error(err)
	// 	return
	// }

	err := context.ShouldBindJSON(&drug)
	if err != nil {
		log.Error(err)
		context.JSON(400, gin.H{
			"msg": "invalid json",
		})
		context.Abort()

		return
	}


	sqlStatement := `
		INSERT INTO drugs
			(name) 
		VALUES
			($1)
		RETURNING drugId;
	`
	err = db.QueryRow(sqlStatement, drug.Name).Scan(&drug.DrugId)
	if err != nil {
		log.Error(err)
		context.JSON(400, gin.H{
			"msg": "drug not found",
		})
		context.Abort()

		return
	}

	context.JSON(200, drug)

}
