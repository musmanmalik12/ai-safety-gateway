package config

import (
	"os"

	"compliance-scanner.local/shared/db"
	"github.com/hibiken/asynq"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Container struct {
	DB        *pgxpool.Pool
	Server    *asynq.Server
	RedisAddr string
}

func NewContainer() *Container {
	// Load environment variables
	dbURL := os.Getenv("DB_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:postgres@db:5432/scanner"
	}

	redisAddr := os.Getenv("REDIS_ADDR")
	if redisAddr == "" {
		redisAddr = "redis:6379"
	}

	// Connect to database
	db.Connect(dbURL)

	// Create asynq server
	server := asynq.NewServer(
		asynq.RedisClientOpt{Addr: redisAddr},
		asynq.Config{Concurrency: 10},
	)

	return &Container{
		DB:        db.DB,
		Server:    server,
		RedisAddr: redisAddr,
	}
}
