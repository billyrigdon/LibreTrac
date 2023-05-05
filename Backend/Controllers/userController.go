package controllers

import (
	Auth "libretrac/Auth"
	Models "libretrac/Models"
	"strings"
	"time"

	log "github.com/sirupsen/logrus"

	"github.com/gin-gonic/gin"
)

// Uses token to get email, query the database, and return userId for accessing data
func GetUserId(token string, context *Models.CustomContext) int {
	var userId int
	email, _ := Auth.GetTokenEmail(token)

	getUserSql := `
		SELECT userId
		FROM users
		WHERE email = $1;
	`
	err := context.DB.QueryRow(getUserSql, email).Scan(&userId)
	if err != nil {
		return 0
	}

	return userId
}

func UpdateEmail(context *Models.CustomContext) {
	var user Models.User

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
	email, err := Auth.GetTokenEmail(token)

	if strings.ToLower(user.Email) != strings.ToLower(email) {
		context.JSON(400, gin.H{
			"msg": "invalid user",
		})
		context.Abort()
		return
	}

	userId := GetUserId(token, context)

	if len(user.NewEmail) > 128 {
		context.JSON(400, gin.H{
			"msg": "email too long",
		})
		context.Abort()
		return
	}


	sqlStatement := `
		UPDATE users
		SET email = $1
		WHERE userId = $2
		AND email = $3;
	`

	_, err = context.DB.Exec(sqlStatement, strings.ToLower(user.NewEmail), userId, strings.ToLower(user.Email))

	if err != nil {
		log.Error(err)
		context.JSON(500, gin.H{
			"msg": "error updating email",
		})
		context.Abort()
		return
	}

	context.JSON(200, gin.H{
		"msg": "email updated",
	})
}

func ResetPassword(context *Models.CustomContext) {
	var user Models.User

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
	email, err := Auth.GetTokenEmail(token)

	if strings.ToLower(user.Email) != strings.ToLower(email) {
		context.JSON(400, gin.H{
			"msg": "invalid user",
		})
		context.Abort()
		return
	}

	userId := GetUserId(token, context)

	//Use bcrypt to generate password hash to save to database
	err = user.HashPassword(user.Password)
	if err != nil {
		log.Error(err)
		context.JSON(500, gin.H{
			"msg": "error hashing password",
		})
		context.Abort()

		return
	}

	if len(user.Password) > 128 {
		context.JSON(400, gin.H{
			"msg": "password too long",
		})
		context.Abort()
		return
	}


	sqlStatement := `
		UPDATE users
		SET password = $1
		WHERE userId = $2;
	`

	_, err = context.DB.Exec(sqlStatement, user.Password, userId)

	if err != nil {
		log.Error(err)
		context.JSON(500, gin.H{
			"msg": "error updating password",
		})
		context.Abort()
		return
	}

	context.JSON(200, gin.H{
		"msg": "password updated",
	})

}

// Requires JSON object containing username,email, and password
func UserSignup(context *Models.CustomContext) {

	var user Models.User

	err := context.ShouldBindJSON(&user)
	if err != nil {
		log.Error(err)
		context.JSON(400, gin.H{
			"msg": "invalid json",
		})
		context.Abort()

		return
	}

	email := strings.ToLower(user.Email)

	//Use bcrypt to generate password hash to save to database
	err = user.HashPassword(user.Password)
	if err != nil {
		log.Error(err)
		context.JSON(500, gin.H{
			"msg": "error hashing password",
		})
		context.Abort()

		return
	}

	if len(user.Password) > 128 || len(user.Username) > 128 || len(user.Email) > 128 {
		context.JSON(400, gin.H{
			"msg": "username/password too long",
		})
		context.Abort()
		return
	}

	//Timestamp in SQL format
	user.DateCreated = time.Now()


	sqlStatement := `
		INSERT INTO users (
			username,
			password,
			email,
			dateCreated
		)
		VALUES ($1,$2,$3,$4);
		`

	_, err = context.DB.Exec(sqlStatement,
		user.Username,
		user.Password,
		email,
		user.DateCreated)

	if err != nil {
		log.Error(err)
		context.JSON(500, gin.H{
			"msg": "Username already exists",
		})
		context.Abort()

		return
	}

	tokenResponse := Auth.GetToken(email)
	tokenResponse.Username = user.Username

	//return login token on success
	context.JSON(200, tokenResponse)

}

// Requires email and password in json, returns login token
func UserLogin(context *Models.CustomContext) {
	var payload Models.LoginPayload
	var user Models.User

	err := context.ShouldBindJSON(&payload)
	if err != nil {
		log.Error(err)
		context.JSON(400, gin.H{
			"msg": "invalid json",
		})
		context.Abort()

		return
	}

	email := strings.ToLower(payload.Email)

	if len(user.Password) > 128 || len(user.Username) > 128 {
		context.JSON(400, gin.H{
			"msg": "username/password too long",
		})
		context.Abort()
		return
	}



	//Query db using email in payload
	sqlStatement := `
		SELECT username,password
		FROM users
		WHERE email = $1;
	`
	row := context.DB.QueryRow(sqlStatement, email)

	//Check username
	err = row.Scan(&user.Username, &user.Password)

	if err != nil {
		log.Error(err)
		context.JSON(401, gin.H{
			"msg": "invalid credentials",
		})
		context.Abort()

		return
	}

	//return failure if password doesn't check out
	err = user.CheckPassword(payload.Password)

	if err != nil {
		log.Error(err)
		context.JSON(401, gin.H{
			"msg": "invalid credentials",
		})
		context.Abort()

		return
	}

	tokenResponse := Auth.GetToken(email)
	tokenResponse.Username = user.Username
	//return login token on success
	context.JSON(200, tokenResponse)

	return
}
