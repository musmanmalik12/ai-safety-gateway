package ai

import (
	"regexp"
	"strings"

	"compliance-scanner.local/shared/compliance"
)

// AIProcessRequest represents the AI safety processing request
type AIProcessRequest struct {
	Prompt string `json:"prompt" binding:"required"`
}

// AIProcessResult represents the complete AI safety gateway response
type AIProcessResult struct {
	Decision        string   `json:"decision"`               // ALLOW, FLAG, BLOCK
	RiskLevel       string   `json:"risk_level"`             // low, medium, high
	Categories      []string `json:"categories"`             // PII, PCI, HR, SECRET
	Flags           []string `json:"flags"`                  // ssn, email, credit_card, phone, etc
	SanitizedPrompt string   `json:"sanitized_prompt"`       // redacted user input
	AIResponse      string   `json:"ai_response"`            // simulated AI response
	RequestID       string   `json:"request_id"`             // for logging/tracing
	OutputRiskLevel string   `json:"output_risk_level"`      // risk level of AI response
	OutputFlags     []string `json:"output_flags"`           // flags found in output
	BlockReason     string   `json:"block_reason,omitempty"` // reason if BLOCK decision
}

// RedactionPatterns maps flag types to their redaction templates and regex patterns
var redactionPatterns = map[string]struct {
	replacement string
	patterns    []*regexp.Regexp
}{
	"ssn": {
		replacement: "[SSN_REDACTED]",
		patterns: []*regexp.Regexp{
			regexp.MustCompile(`\b\d{3}-\d{2}-\d{4}\b`),
			regexp.MustCompile(`\b\d{9}\b`),
		},
	},
	"credit_card": {
		replacement: "[CARD_REDACTED]",
		patterns: []*regexp.Regexp{
			regexp.MustCompile(`\b(?:\d{4}[\s-]?){3}\d{4}\b`),
			regexp.MustCompile(`\b\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\b`),
		},
	},
	"email": {
		replacement: "[EMAIL_REDACTED]",
		patterns: []*regexp.Regexp{
			regexp.MustCompile(`\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b`),
		},
	},
	"phone": {
		replacement: "[PHONE_REDACTED]",
		patterns: []*regexp.Regexp{
			regexp.MustCompile(`\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b`),
		},
	},
	"salary": {
		replacement: "[SALARY_REDACTED]",
		patterns: []*regexp.Regexp{
			regexp.MustCompile(`(?i)\$\d+(?:,\d{3})*(?:\.\d{2})?`),
		},
	},
	"api_key": {
		replacement: "[API_KEY_REDACTED]",
		patterns: []*regexp.Regexp{
			regexp.MustCompile(`(?i)(?:api[_-]?key|token|secret)[\s:=]+[\w\-]{20,}`),
		},
	},
}

// ProcessWithAISafety implements the complete AI Safety Gateway workflow
func ProcessWithAISafety(prompt string, requestID string) AIProcessResult {
	result := AIProcessResult{
		RequestID:   requestID,
		Decision:    "ALLOW",
		RiskLevel:   "low",
		Flags:       []string{},
		Categories:  []string{},
		OutputFlags: []string{},
	}

	// Step 1: Scan input prompt for compliance issues
	scanResult := compliance.ScanText(prompt)

	result.RiskLevel = scanResult.RiskLevel
	result.Flags = scanResult.Flags
	result.Categories = scanResult.Categories
	result.Decision = scanResult.Decision

	// Step 2: Decision handling - BLOCK decision
	if scanResult.Decision == "BLOCK" {
		result.BlockReason = "Blocked: " + strings.Join(scanResult.Reasoning, "; ")
		return result
	}

	// Step 3: Redaction for FLAG decision
	sanitized := prompt
	if scanResult.Decision == "FLAG" {
		sanitized = RedactSensitiveData(prompt, scanResult.Flags)
		result.SanitizedPrompt = sanitized
	} else {
		// ALLOW - pass through as-is
		result.SanitizedPrompt = prompt
		sanitized = prompt
	}

	// Step 4: Generate simulated AI response
	result.AIResponse = GenerateAIResponse(sanitized)

	// Step 5: Scan AI response for compliance issues (output filtering)
	outputScanResult := compliance.ScanText(result.AIResponse)
	result.OutputRiskLevel = outputScanResult.RiskLevel
	result.OutputFlags = outputScanResult.Flags

	// If output has issues, redact them too
	if len(outputScanResult.Flags) > 0 {
		result.AIResponse = RedactSensitiveData(result.AIResponse, outputScanResult.Flags)
	}

	return result
}

// RedactSensitiveData applies redaction patterns to text based on detected flags
func RedactSensitiveData(text string, flags []string) string {
	result := text

	// Create a set for faster lookup
	flagSet := make(map[string]bool)
	for _, flag := range flags {
		flagSet[flag] = true
	}

	// Apply redaction patterns for detected flags
	for flagType, redaction := range redactionPatterns {
		if flagSet[flagType] {
			for _, pattern := range redaction.patterns {
				result = pattern.ReplaceAllString(result, redaction.replacement)
			}
		}
	}

	return result
}

// GenerateAIResponse creates a simulated AI response
// In production, this would call a real LLM, but for demo we just prepend a summary
func GenerateAIResponse(sanitizedPrompt string) string {
	// Simple summary response - Option A
	return "AI Response: " + sanitizedPrompt
}
