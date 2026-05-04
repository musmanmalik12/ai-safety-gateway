FROM golang:1.26-alpine

WORKDIR /app

COPY . .

WORKDIR /app/services/api

RUN go build -o main ./cmd

EXPOSE 3000

CMD ["./main"]