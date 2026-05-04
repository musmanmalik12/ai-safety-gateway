package main

import "log"

func main() {
	log.Println("Worker started...")
	select {} // keeps it running
}