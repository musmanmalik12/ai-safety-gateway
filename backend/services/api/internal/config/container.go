package config

import (
	"os"

	"compliance-scanner.local/shared/db"
	"github.com/hibiken/asynq"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Container struct {
	DB          *pgxpool.Pool
	RedisClient *asynq.Client
	RedisAddr   string
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

	// Create Redis client
	redisClient := asynq.NewClient(asynq.RedisClientOpt{
		Addr: redisAddr,
	})

	return &Container{
		DB:          db.DB,
		RedisClient: redisClient,
		RedisAddr:   redisAddr,
	}
}

func (c *Container) Close() error {
	if c.RedisClient != nil {
		return c.RedisClient.Close()
	}
	return nil
}
