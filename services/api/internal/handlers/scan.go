package handlers

import (
	"context"
	"net/http"
	"time"

	"compliance-scanner/api/internal/db"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ScanRequest struct {
	InputText string `json:"input_text"`
}

func CreateScan(c *gin.Context) {
	var req ScanRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	jobID := uuid.New().String()
	now := time.Now()

	_, err := db.DB.Exec(context.Background(),
		`INSERT INTO scan_jobs (id, status, input_text, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5)`,
		jobID, "pending", req.InputText, now, now,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create job"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"job_id": jobID,
		"status": "pending",
	})
}