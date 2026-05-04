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
	InputText string `json:"input_text" binding:"required"`
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

// CreateScan submits text for compliance and risk scanning
// It processes user-submitted text to detect compliance risks, PII, or policy violations
func (h *Handler) CreateScan(c *gin.Context) {
	var req ScanRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: input_text is required"})
		return
	}

	if req.InputText == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "input_text cannot be empty"})
		return
	}

	jobID := uuid.New().String()
	now := time.Now()

	// get request id
	rid, _ := c.Get(middleware.RequestIDKey)
	requestID := rid.(string)

	// 1. DB insert - Store the scan job with pending status
	_, err := h.container.DB.Exec(context.Background(),
		`INSERT INTO scan_jobs (id, status, input_text, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5)`,
		jobID, "pending", req.InputText, now, now,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create scan job"})
		return
	}

	// 2. Enqueue to async processor (Redis)
	payload := ScanPayload{
		JobID:     jobID,
		RequestID: requestID,
	}

	b, _ := json.Marshal(payload)
	task := asynq.NewTask("scan:process", b)

	_, err = h.container.RedisClient.Enqueue(task)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to queue scan task"})
		return
	}

	// 3. Response
	c.JSON(http.StatusOK, gin.H{
		"job_id":     jobID,
		"status":     "queued",
		"request_id": requestID,
		"message":    "Scan job queued for processing. Use job_id to check results.",
	})
}

// GetScanStatus retrieves the status and results of a compliance scan
func (h *Handler) GetScanStatus(c *gin.Context) {
	jobID := c.Param("id")

	var status string
	var input string
	var metadata *string

	err := h.container.DB.QueryRow(context.Background(),
		`SELECT status, input_text, metadata FROM scan_jobs WHERE id=$1`,
		jobID,
	).Scan(&status, &input, &metadata)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Scan job not found"})
		return
	}

	response := gin.H{
		"job_id":     jobID,
		"status":     status,
		"input_text": input,
	}

	// Include compliance scan results if available
	if metadata != nil && *metadata != "" {
		var scanResults interface{}
		json.Unmarshal([]byte(*metadata), &scanResults)
		response["results"] = scanResults
	}

	c.JSON(http.StatusOK, response)
}
