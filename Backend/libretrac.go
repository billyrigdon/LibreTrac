package main

import (
	"io"
	Auth "libretrac/Auth"
	Controllers "libretrac/Controllers"
	"os"

	"time"

	_ "github.com/lib/pq"

	// "database/sql"
	Models "libretrac/Models"
	Utilities "libretrac/Utilities"

	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
)

// type CustomContext struct {
// 	*gin.Context
// 	DB *sql.DB
// }

var db, dbErr = Utilities.ConnectPostgres()

func withDB(handler func(*Models.CustomContext)) gin.HandlerFunc {
	return func(c *gin.Context) {
		cc := &Models.CustomContext{
			Context: c,
			DB:      db, // Assuming 'db' is your sql.DB instance
		}
		handler(cc)
	}
}

func setupRouter() *gin.Engine {
	//Configure logging
	gin.DisableConsoleColor()
	logFile := OpenLogFile("libreTrac.log")
	gin.DefaultWriter = io.MultiWriter(logFile)

	//Create router
	router := gin.Default()

	//Serve frontend
	router.Use(static.Serve("/", static.LocalFile("./dist", true)))
	router.Use(static.Serve("/splash", static.LocalFile("./dist", true)))
	router.Use(static.Serve("/login", static.LocalFile("./dist", true)))
	router.Use(static.Serve("/signup", static.LocalFile("./dist", true)))
	router.Use(static.Serve("/stories", static.LocalFile("./dist", true)))
	router.Use(static.Serve("/createProfile", static.LocalFile("./dist", true)))
	router.Use(static.Serve("/profile", static.LocalFile("./dist", true)))
	router.Use(static.Serve("/addDrug", static.LocalFile("./dist", true)))
	router.Use(static.Serve("/addStory", static.LocalFile("./dist", true)))
	router.Use(static.Serve("/explore", static.LocalFile("./dist", true)))
	router.Use(static.Serve("/story", static.LocalFile("./dist", true)))

	api := router.Group("/api")

	{
		public := api.Group("/public")
		//TODO:remove for prod
		public.Use(corsInterceptor())

		{
			//Serve public login/signup routes
			public.POST("login", withDB(Controllers.UserLogin))
			public.POST("signup", withDB(Controllers.UserSignup))

			//Serve public explore page
			public.GET("/story/get", withDB(Controllers.GetAllStories))
			public.GET("/story/comment", withDB(Controllers.GetComments))
			public.GET("/story", withDB(Controllers.GetSingleStory))
			public.GET("/mood/get", withDB(Controllers.GetAverageStoryMood))
		}

		//Serve routes that require valid jwt token
		protected := api.Group("/protected").Use(Auth.Auth())
		//TODO:remove for prod
		protected.Use(corsInterceptor())
		{
			//Serve user profile routes
			protected.GET("/user", withDB(Controllers.GetUserProfile))
			protected.POST("/user/create", withDB(Controllers.CreateUserProfile))
			protected.POST("/user/update", withDB(Controllers.UpdateUserProfile))
			protected.GET("/user/mood/get", withDB(Controllers.GetAverageUserMood))
			protected.GET("user/mood/get/month", withDB(Controllers.GetAverageUserMoodForMonth))
			protected.POST("/user/password/reset", withDB(Controllers.ResetPassword))
			protected.POST("/user/email/update", withDB(Controllers.UpdateEmail))

			// Serve story routes
			protected.GET("/story/user", withDB(Controllers.GetUserStories))
			protected.GET("/story/user/isUserStory", withDB(Controllers.IsUserStory))
			protected.POST("/story/create", withDB(Controllers.CreateStory))
			protected.POST("/story/update", withDB(Controllers.UpdateStory))
			protected.DELETE("/story/delete", withDB(Controllers.DeleteStory))
			protected.POST("/story/vote/add", withDB(Controllers.AddStoryVote))
			protected.POST("/story/vote/remove", withDB(Controllers.RemoveStoryVote))

			//Serve comment routes
			protected.POST("/story/comment/create", withDB(Controllers.AddComment))
			protected.DELETE("/story/comment/delete", withDB(Controllers.DeleteComment))
			protected.POST("/story/comment/update", withDB(Controllers.UpdateComment))
			protected.POST("/story/comment/vote/add", withDB(Controllers.AddCommentVote))
			protected.POST("/story/comment/vote/remove", withDB(Controllers.RemoveCommentVote))

			//Serve drug routes
			protected.GET("/drug", withDB(Controllers.GetAllDrugs))
			protected.POST("/drug/create", withDB(Controllers.AddDrug))
			protected.GET("/drug/get", withDB(Controllers.GetDrug))

			//Serve user_drug routes
			protected.GET("/user/drugs/get", withDB(Controllers.GetUserDrugs))
			protected.POST("/user/drugs/add", withDB(Controllers.AddUserDrug))
			protected.POST("/user/drugs/update", withDB(Controllers.UpdateUserDrug))
			protected.DELETE("/user/drugs/remove", withDB(Controllers.RemoveUserDrug))

			//Serve drug routes
			protected.GET("/disorder", withDB(Controllers.GetAllDisorders))
			protected.POST("/disorder/create", withDB(Controllers.AddDisorder))
			protected.GET("/disorder/get", withDB(Controllers.GetDisorder))

			//Serve user_drug routes
			protected.GET("/user/disorders/get", withDB(Controllers.GetUserDisorders))
			protected.POST("/user/disorders/add", withDB(Controllers.AddUserDisorder))
			protected.DELETE("/user/disorders/remove", withDB(Controllers.RemoveUserDisorder))

			//Serve notification routes
			protected.GET("/notifications/get", withDB(Controllers.GetNotifications))
			protected.GET("/notifications/viewed", withDB(Controllers.ClearNotifications))
			protected.GET("/notifications/get/stories", withDB(Controllers.GetNotificationStories))
		}

	}

	return router
}

// TODO:Remove for prod
// Cors header and handler of preflight options
func corsInterceptor() gin.HandlerFunc {
	return func(context *gin.Context) {
		context.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		context.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		context.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		context.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if context.Request.Method == "OPTIONS" {
			context.AbortWithStatus(204)
			return
		}

		context.Next()
	}
}

// Create log file if it doesn't exist, append if it does.
// The 666 is file permissions, not some hidden satanic message in my code.
func OpenLogFile(file string) *os.File {
	logFile, err := os.OpenFile(file, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0666)
	if err != nil {
		log.Fatal(err)
	}
	return logFile
}

func main() {
	//Set logrus to use log file
	logFile := OpenLogFile("libreTrac.log")
	log.SetOutput(logFile)

	// db, dbErr := Utilities.ConnectPostgres()
	defer db.Close()

	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(time.Minute * 30)

	dbErr = db.Ping()
	if dbErr != nil {
		log.Error(dbErr)
	}

	//Create server
	router := setupRouter()
	//TODO: remove for prod
	router.Use(corsInterceptor())

	//Start server
	router.Run(":8080")
}
