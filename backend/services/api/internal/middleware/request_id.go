package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const RequestIDKey = "request_id"

func RequestIDMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// check if request already has ID (optional)
		rid := c.GetHeader("X-Request-ID")
		if rid == "" {
			rid = uuid.New().String()
		}

		// store in context
		c.Set(RequestIDKey, rid)

		// return in response header
		c.Writer.Header().Set("X-Request-ID", rid)

		c.Next()
	}
}
