package main

import (
	"context"
	"encoding/json"
	"log"

	"compliance-scanner.local/worker/internal/compliance"
	"compliance-scanner.local/worker/internal/config"
	"github.com/hibiken/asynq"
)

type ScanPayload struct {
	JobID     string `json:"job_id"`
	RequestID string `json:"request_id"`
}

type Processor struct {
	container *config.Container
}

func NewProcessor(c *config.Container) *Processor {
	return &Processor{container: c}
}

// HandleScanTask processes a compliance scan by examining text for risks, PII, and policy violations
func (p *Processor) HandleScanTask(ctx context.Context, t *asynq.Task) error {
	var payload ScanPayload

	if err := json.Unmarshal(t.Payload(), &payload); err != nil {
		return err
	}

	log.Printf("[WORKER] request_id=%s job_id=%s START", payload.RequestID, payload.JobID)

	// update to processing
	_, err := p.container.DB.Exec(ctx,
		`UPDATE scan_jobs SET status=$1, updated_at=NOW() WHERE id=$2`,
		"processing", payload.JobID,
	)
	if err != nil {
		return err
	}

	// Fetch the input text from database
	var inputText string
	err = p.container.DB.QueryRow(ctx,
		`SELECT input_text FROM scan_jobs WHERE id=$1`,
		payload.JobID,
	).Scan(&inputText)
	if err != nil {
		return err
	}

	// Perform compliance scan on the text
	scanResult := compliance.ScanText(inputText)

	// Store compliance scan results as metadata
	scanResultJSON, _ := json.Marshal(scanResult)

	// update to completed with results
	_, err = p.container.DB.Exec(ctx,
		`UPDATE scan_jobs 
		 SET status=$1, 
		     metadata=$2,
		     updated_at=NOW() 
		 WHERE id=$3`,
		"completed", string(scanResultJSON), payload.JobID,
	)
	if err != nil {
		return err
	}

	log.Printf("[WORKER] request_id=%s job_id=%s DONE - Risk Level: %s", payload.RequestID, payload.JobID, scanResult.RiskLevel)

	return nil
}

func main() {
	log.Println("Compliance Scan Worker started...")

	// Initialize dependency injection container
	container := config.NewContainer()

	processor := NewProcessor(container)

	mux := asynq.NewServeMux()
	mux.HandleFunc("scan:process", processor.HandleScanTask)

	if err := container.Server.Run(mux); err != nil {
		log.Fatal(err)
	}
}
