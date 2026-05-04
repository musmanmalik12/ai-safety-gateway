package main

import (
	"compliance-scanner.local/api/internal/config"
	"compliance-scanner.local/api/internal/handlers"
	"compliance-scanner.local/api/internal/middleware"

	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize dependency injection container
	container := config.NewContainer()
	defer container.Close()

	handler := handlers.NewHandler(container)

	r := gin.Default()

	r.Use(middleware.RequestIDMiddleware())

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	r.POST("/scan", handler.CreateScan)
	r.GET("/scan/:id", handler.GetScanStatus)

	r.Run(":3000")
}
