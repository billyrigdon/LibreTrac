package main

import (
	"io"
	Auth "libretrac/Auth"
	Controllers "libretrac/Controllers"
	"os"

	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
)

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
			public.POST("login", Controllers.UserLogin)
			public.POST("signup", Controllers.UserSignup)

			//Serve public explore page
			public.GET("/story/get", Controllers.GetAllStories)
			public.GET("/story/comment", Controllers.GetComments)
			public.GET("/story", Controllers.GetSingleStory)
			public.GET("/mood/get", Controllers.GetAverageStoryMood)
		}

		//Serve routes that require valid jwt token
		protected := api.Group("/protected").Use(Auth.Auth())
		//TODO:remove for prod
		protected.Use(corsInterceptor())
		{
			//Serve user profile routes
			protected.GET("/user", Controllers.GetUserProfile)
			protected.POST("/user/create", Controllers.CreateUserProfile)
			protected.POST("/user/update", Controllers.UpdateUserProfile)
			protected.GET("/user/mood/get", Controllers.GetAverageUserMood)
			protected.GET("user/mood/get/month", Controllers.GetAverageUserMoodForMonth)
			protected.POST("/user/password/reset", Controllers.ResetPassword)
			protected.POST("/user/email/update", Controllers.UpdateEmail)

			// Serve story routes
			protected.GET("/story/user", Controllers.GetUserStories)
			protected.GET("/story/user/isUserStory", Controllers.IsUserStory)
			protected.POST("/story/create", Controllers.CreateStory)
			protected.POST("/story/update", Controllers.UpdateStory)
			protected.DELETE("/story/delete", Controllers.DeleteStory)
			protected.POST("/story/vote/add", Controllers.AddStoryVote)
			protected.POST("/story/vote/remove", Controllers.RemoveStoryVote)

			//Serve comment routes
			protected.POST("/story/comment/create", Controllers.AddComment)
			protected.DELETE("/story/comment/delete", Controllers.DeleteComment)
			protected.POST("/story/comment/update", Controllers.UpdateComment)
			protected.POST("/story/comment/vote/add", Controllers.AddCommentVote)
			protected.POST("/story/comment/vote/remove", Controllers.RemoveCommentVote)

			//Serve drug routes
			protected.GET("/drug", Controllers.GetAllDrugs)
			protected.POST("/drug/create", Controllers.AddDrug)
			protected.GET("/drug/get", Controllers.GetDrug)

			//Serve user_drug routes
			protected.GET("/user/drugs/get", Controllers.GetUserDrugs)
			protected.POST("/user/drugs/add", Controllers.AddUserDrug)
			protected.POST("/user/drugs/update", Controllers.UpdateUserDrug)
			protected.DELETE("/user/drugs/remove", Controllers.RemoveUserDrug)

			//Serve drug routes
			protected.GET("/disorder", Controllers.GetAllDisorders)
			protected.POST("/disorder/create", Controllers.AddDisorder)
			protected.GET("/disorder/get", Controllers.GetDisorder)

			//Serve user_drug routes
			protected.GET("/user/disorders/get", Controllers.GetUserDisorders)
			protected.POST("/user/disorders/add", Controllers.AddUserDisorder)
			protected.DELETE("/user/disorders/remove", Controllers.RemoveUserDisorder)

			//Serve notification routes
			protected.GET("/notifications/get", Controllers.GetNotifications)
			protected.GET("/notifications/viewed", Controllers.ClearNotifications)
			protected.GET("/notifications/get/stories", Controllers.GetNotificationStories)
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

	//Create server
	router := setupRouter()
	//TODO: remove for prod
	router.Use(corsInterceptor())

	//Start server
	router.Run(":8080")
}
