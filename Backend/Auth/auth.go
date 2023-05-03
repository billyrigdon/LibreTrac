package auth

import (
	"errors"
	"fmt"
	"os"
	"strings"
	"time"

	Models "libretrac/Models"

	jwt "github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	log "github.com/sirupsen/logrus"
)

// JwtWrapper wraps the signing key and the issuer
type JwtWrapper struct {
	SecretKey       string
	Issuer          string
	ExpirationHours int64
}

// JwtClaim adds email as a claim to the token
type JwtClaim struct {
	Email string
	jwt.StandardClaims
}

// Generate JWT
func (j *JwtWrapper) GenerateToken(email string) (signedToken string, err error) {
	claims := &JwtClaim{
		Email: strings.ToLower(email),
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Local().Add(time.Hour * time.Duration(j.ExpirationHours)).Unix(),
			Issuer:    j.Issuer,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	signedToken, err = token.SignedString([]byte(j.SecretKey))
	if err != nil {
		return
	}

	return
}

// ValidateToken validates the jwt token
func (j *JwtWrapper) ValidateToken(signedToken string) (claims *JwtClaim, err error) {
	token, err := jwt.ParseWithClaims(
		signedToken,
		&JwtClaim{},
		func(token *jwt.Token) (interface{}, error) {
			return []byte(j.SecretKey), nil
		},
	)

	if err != nil {
		return
	}

	claims, ok := token.Claims.(*JwtClaim)
	if !ok {
		err = errors.New("Couldn't parse claims")
		return
	}

	if claims.ExpiresAt < time.Now().Local().Unix() {
		err = errors.New("JWT is expired")
		return
	}

	return

}

// Gets email address from token, returns email and err
func GetTokenEmail(token string) (string, error) {

	err := godotenv.Load(".env")
	if err != nil {
		fmt.Println(err)
	}

	extractedToken := strings.Split(token, "Bearer ")
	clientToken := strings.TrimSpace(extractedToken[1])

	jwtWrapper := JwtWrapper{
		SecretKey: os.Getenv("secret_key"),
		Issuer:    os.Getenv("issuer"),
	}

	claims, err := jwtWrapper.ValidateToken(clientToken)

	return strings.ToLower(claims.Email), err
}

// Authorization middleware
func Auth() gin.HandlerFunc {

	err := godotenv.Load(".env")
	if err != nil {
		fmt.Println(err)
	}

	return func(context *gin.Context) {

		context.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		context.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		context.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		context.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if context.Request.Method == "OPTIONS" {
			context.AbortWithStatus(204)
			return
		}

		clientToken := context.Request.Header.Get("Authorization")
		if clientToken == "" {
			context.JSON(403, "No Authorization header provided")
			context.Abort()
			return
		}

		extractedToken := strings.Split(clientToken, "Bearer ")

		if len(extractedToken) == 2 {
			clientToken = strings.TrimSpace(extractedToken[1])
		} else {
			context.JSON(400, "Incorrect Format of Authorization Token")
			context.Abort()
			return
		}

		jwtWrapper := JwtWrapper{
			SecretKey: os.Getenv("secret_key"),
			Issuer:    os.Getenv("issuer"),
		}

		claims, err := jwtWrapper.ValidateToken(clientToken)
		if err != nil {
			context.JSON(401, err.Error())
			context.Abort()
			return
		}

		context.Set("email", claims.Email)

		context.Next()

	}
}

func GetToken(email string) Models.LoginResponse {
	tokenResponse := Models.LoginResponse{
		Token: "",
	}

	//load environment variables
	err := godotenv.Load(".env")
	if err != nil {
		log.Error(err)
		return tokenResponse
	}

	//Generate token and respond with it
	jwtWrapper := JwtWrapper{
		SecretKey:       os.Getenv("secret_key"),
		Issuer:          os.Getenv("issuer"),
		ExpirationHours: 720,
	}

	signedToken, err := jwtWrapper.GenerateToken(strings.ToLower(email))
	if err != nil {
		log.Error(err)
		return tokenResponse
	}

	tokenResponse.Token = signedToken

	return tokenResponse
}
