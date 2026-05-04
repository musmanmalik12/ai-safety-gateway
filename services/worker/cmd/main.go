package main

import (
	"context"
	"encoding/json"
	"log"
	"time"

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

	// simulate work
	time.Sleep(5 * time.Second)

	// update to completed
	_, err = p.container.DB.Exec(ctx,
		`UPDATE scan_jobs SET status=$1, updated_at=NOW() WHERE id=$2`,
		"completed", payload.JobID,
	)
	if err != nil {
		return err
	}

	log.Printf("[WORKER] request_id=%s job_id=%s DONE", payload.RequestID, payload.JobID)

	return nil
}

func main() {
	log.Println("Worker started...")

	// Initialize dependency injection container
	container := config.NewContainer()
	processor := NewProcessor(container)

	mux := asynq.NewServeMux()
	mux.HandleFunc("scan:process", processor.HandleScanTask)

	if err := container.Server.Run(mux); err != nil {
		log.Fatal(err)
	}
}
