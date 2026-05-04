FROM golang:1.26-alpine

WORKDIR /app

COPY . .

WORKDIR /app/services/worker

RUN go build -o main ./cmd

CMD ["./main"]