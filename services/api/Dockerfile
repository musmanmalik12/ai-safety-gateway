FROM golang:1.25-alpine

WORKDIR /app

COPY . .

RUN go build -o main ./cmd

EXPOSE 3000

CMD ["./main"]