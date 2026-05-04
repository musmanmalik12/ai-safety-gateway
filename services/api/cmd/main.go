package main

import (
	"compliance-scanner.local/api/internal/handlers"
	"compliance-scanner.local/shared/db"

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
