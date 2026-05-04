package main

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/hibiken/asynq"

	"compliance-scanner.local/shared/db"
)

type ScanPayload struct {
	JobID string `json:"job_id"`
}

func handleScanTask(ctx context.Context, t *asynq.Task) error {
	var payload ScanPayload

	if err := json.Unmarshal(t.Payload(), &payload); err != nil {
		return err
	}

	jobID := payload.JobID

	log.Println("Processing job:", jobID)

	// 1. Update status → processing
	_, err := db.DB.Exec(ctx,
		`UPDATE scan_jobs SET status=$1, updated_at=NOW() WHERE id=$2`,
		"processing", jobID,
	)
	if err != nil {
		return err
	}

	// 2. Simulate work (your "scanner engine")
	time.Sleep(5 * time.Second)

	// 3. Update status → completed
	_, err = db.DB.Exec(ctx,
		`UPDATE scan_jobs SET status=$1, updated_at=NOW() WHERE id=$2`,
		"completed", jobID,
	)
	if err != nil {
		return err
	}

	log.Println("Completed job:", jobID)
	return nil
}

func main() {
	log.Println("Worker started...")

	db.Connect("postgres://postgres:postgres@db:5432/scanner")

	srv := asynq.NewServer(
		asynq.RedisClientOpt{Addr: "redis:6379"},
		asynq.Config{Concurrency: 10},
	)

	mux := asynq.NewServeMux()
	mux.HandleFunc("scan:process", handleScanTask)

	if err := srv.Run(mux); err != nil {
		log.Fatal(err)
	}
}
