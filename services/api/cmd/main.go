package main

import (
	"compliance-scanner/api/internal/db"
	"compliance-scanner/api/internal/handlers"

	"github.com/gin-gonic/gin"
)

func main() {
	db.Connect("postgres://postgres:postgres@db:5432/scanner")

	r := gin.Default()

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	r.POST("/scan", handlers.CreateScan)

	r.Run(":3000")
}
