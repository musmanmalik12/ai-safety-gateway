package models

import "time"

type ScanJob struct {
	ID        string    `json:"id"`
	Status    string    `json:"status"`
	FilePath  string    `json:"file_path,omitempty"`
	InputText string    `json:"input_text,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
