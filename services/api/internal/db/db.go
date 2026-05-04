package db

import (
	"context"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

var DB *pgxpool.Pool

func Connect(databaseURL string) {
	var err error

	for i := 0; i < 10; i++ {
		DB, err = pgxpool.New(context.Background(), databaseURL)
		if err == nil {
			err = DB.Ping(context.Background())
			if err == nil {
				log.Println("Connected to Postgres")
				return
			}
		}

		log.Println("DB not ready, retrying...")
		time.Sleep(2 * time.Second)
	}

	log.Fatal("DB connection failed after retries:", err)
}
