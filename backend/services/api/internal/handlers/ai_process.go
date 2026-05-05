package handlers

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"

	"compliance-scanner.local/api/internal/ai"
	"compliance-scanner.local/api/internal/middleware"
)

// ProcessWithAI handles the AI safety gateway processing
// POST /ai/process - Submit text for compliance-safe AI processing
func (h *Handler) ProcessWithAI(c *gin.Context) {
	var req ai.AIProcessRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: prompt is required"})
		return
	}

	if req.Prompt == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "prompt cannot be empty"})
		return
	}

	// Get request ID from middleware
	rid, _ := c.Get(middleware.RequestIDKey)
	requestID := rid.(string)

	// Process with AI Safety Gateway
	result := ai.ProcessWithAISafety(req.Prompt, requestID)

	// Log the processing result
	logAIProcessing(requestID, result)

	// Respond based on decision
	switch result.Decision {
	case "BLOCK":
		c.JSON(http.StatusForbidden, gin.H{
			"decision":   result.Decision,
			"message":    result.BlockReason,
			"risk_level": result.RiskLevel,
			"categories": result.Categories,
			"flags":      result.Flags,
			"request_id": requestID,
		})
	default:
		// FLAG or ALLOW
		c.JSON(http.StatusOK, result)
	}
}

// logAIProcessing logs the AI processing result for infrastructure signals
func logAIProcessing(requestID string, result ai.AIProcessResult) {
	decision := result.Decision
	riskLevel := result.RiskLevel
	flags := result.Flags
	outputFlags := result.OutputFlags

	flagsStr := ""
	if len(flags) > 0 {
		flagsStr = " input_flags=" + logStringSlice(flags)
	}

	outputFlagsStr := ""
	if len(outputFlags) > 0 {
		outputFlagsStr = " output_flags=" + logStringSlice(outputFlags)
	}

	log.Printf("[AI-GATEWAY] request_id=%s decision=%s risk_level=%s%s%s",
		requestID, decision, riskLevel, flagsStr, outputFlagsStr)
}

// logStringSlice converts a slice to a comma-separated string for logging
func logStringSlice(items []string) string {
	if len(items) == 0 {
		return ""
	}
	result := items[0]
	for _, item := range items[1:] {
		result += "," + item
	}
	return result
}
