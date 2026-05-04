package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/hibiken/asynq"

	"compliance-scanner.local/api/internal/config"
	"compliance-scanner.local/api/internal/middleware"
)

type ScanRequest struct {
	InputText string `json:"input_text"`
}

type ScanPayload struct {
	JobID     string `json:"job_id"`
	RequestID string `json:"request_id"`
}

type Handler struct {
	container *config.Container
}

func NewHandler(c *config.Container) *Handler {
	return &Handler{container: c}
}

func (h *Handler) CreateScan(c *gin.Context) {
	var req ScanRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	jobID := uuid.New().String()
	now := time.Now()

	// get request id
	rid, _ := c.Get(middleware.RequestIDKey)
	requestID := rid.(string)

	// 1. DB insert
	_, err := h.container.DB.Exec(context.Background(),
		`INSERT INTO scan_jobs (id, status, input_text, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5)`,
		jobID, "pending", req.InputText, now, now,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 2. enqueue to redis
	payload := ScanPayload{
		JobID:     jobID,
		RequestID: requestID,
	}

	b, _ := json.Marshal(payload)
	task := asynq.NewTask("scan:process", b)

	_, err = h.container.RedisClient.Enqueue(task)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 3. response
	c.JSON(http.StatusOK, gin.H{
		"job_id":     jobID,
		"status":     "queued",
		"request_id": requestID,
	})
}

func (h *Handler) GetScanStatus(c *gin.Context) {
	jobID := c.Param("id")

	var status string
	var input string

	err := h.container.DB.QueryRow(context.Background(),
		`SELECT status, input_text FROM scan_jobs WHERE id=$1`,
		jobID,
	).Scan(&status, &input)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "job not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"job_id": jobID,
		"status": status,
		"input":  input,
	})
}
