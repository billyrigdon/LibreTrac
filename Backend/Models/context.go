package models

import (
	_ "github.com/lib/pq"
	"database/sql"
	"github.com/gin-gonic/gin"
)

type CustomContext struct {
	*gin.Context
	DB *sql.DB
}