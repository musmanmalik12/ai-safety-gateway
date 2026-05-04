package main

import (
	"compliance-scanner.local/api/internal/config"
	"compliance-scanner.local/api/internal/handlers"
	"compliance-scanner.local/api/internal/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize dependency injection container
	container := config.NewContainer()
	defer container.Close()

	handler := handlers.NewHandler(container)

	r := gin.Default()

	// Add CORS middleware
	r.Use(cors.Default())

	r.Use(middleware.RequestIDMiddleware())

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "service": "compliance-scanner-api"})
	})

	// Compliance scanning API endpoints
	r.POST("/scan", handler.CreateScan)
	r.GET("/scan/:id", handler.GetScanStatus)

	r.Run(":3000")
}
