package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/hibiken/asynq"

	"compliance-scanner.local/shared/db"
)

type ScanRequest struct {
	InputText string `json:"input_text"`
}

type ScanPayload struct {
	JobID string `json:"job_id"`
}

func CreateScan(c *gin.Context) {
	var req ScanRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	// 1. Create Job ID
	jobID := uuid.New().String()
	now := time.Now()

	// 2. Insert into DB (source of truth)
	_, err := db.DB.Exec(context.Background(),
		`INSERT INTO scan_jobs (id, status, input_text, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5)`,
		jobID, "pending", req.InputText, now, now,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to create job: " + err.Error(),
		})
		return
	}

	// 3. Create Redis task payload
	payload, err := json.Marshal(ScanPayload{
		JobID: jobID,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to build task payload",
		})
		return
	}

	// 4. Enqueue job in Redis (Asynq)
	client := asynq.NewClient(asynq.RedisClientOpt{
		Addr: "redis:6379",
	})
	defer client.Close()

	task := asynq.NewTask("scan:process", payload)

	info, err := client.Enqueue(task)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to enqueue job: " + err.Error(),
		})
		return
	}

	// 5. Response
	c.JSON(http.StatusOK, gin.H{
		"job_id":  jobID,
		"status":  "queued",
		"task_id": info.ID,
	})
}
