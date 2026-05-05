package compliance

import (
	"regexp"
	"strings"
)

// ScanResult contains compliance scan results with complete classification
type ScanResult struct {
	RiskLevel  string   `json:"risk_level"` // low, medium, high
	RiskScore  int      `json:"risk_score"` // 0-100 numeric severity
	Decision   string   `json:"decision"`   // ALLOW, FLAG, BLOCK
	Categories []string `json:"categories"` // multiple: PII, PCI, HR, SECRET
	Flags      []string `json:"flags"`      // machine-readable lowercase (ssn, email, salary)
	Labels     []string `json:"labels"`     // human-readable display names
	Reasoning  []string `json:"reasoning"`  // list of reasons
	Summary    string   `json:"summary"`    // clean single sentence
}

// Risk score mapping for each flag type
var flagScores = map[string]int{
	"ssn":         95,
	"credit_card": 90,
	"api_key":     92,
	"email":       60,
	"phone":       55,
	"salary":      50,
	"ip_address":  40,
}

// Category mapping for each flag type
var flagCategories = map[string]string{
	"ssn":         "PII",
	"credit_card": "PCI",
	"api_key":     "SECRET",
	"email":       "PII",
	"phone":       "PII",
	"salary":      "HR",
	"ip_address":  "PII",
}

// Label mapping for display
var flagLabels = map[string]string{
	"ssn":         "Social Security Number",
	"credit_card": "Credit Card Number",
	"api_key":     "API Key/Token",
	"email":       "Email Address",
	"phone":       "Phone Number",
	"salary":      "Salary/Compensation Data",
	"ip_address":  "IP Address",
}

// ScanText scans text for compliance risks, PII, and policy violations
// Returns deterministic results using strict rule-based classification
func ScanText(inputText string) ScanResult {
	result := ScanResult{
		Flags:      []string{},
		Labels:     []string{},
		Categories: []string{},
		Reasoning:  []string{},
		RiskLevel:  "low",
		Decision:   "ALLOW",
		RiskScore:  0,
	}

	// Detect all patterns
	detectPatterns(&result, inputText)

	// Calculate highest risk score
	result.RiskScore = calculateRiskScore(result.Flags)

	// Determine decision based on risk level
	result.Decision = determineDecision(result.RiskLevel)

	// Generate summary
	result.Summary = generateSummary(result)

	return result
}

// detectPatterns identifies all PII, secrets, and compliance issues
func detectPatterns(result *ScanResult, text string) {
	lowerText := strings.ToLower(text)
	categoriesMap := make(map[string]bool) // Track unique categories

	// Rule 1: SSN → HIGH (PII)
	if detectSSN(text) {
		addFlag(result, "ssn")
		categoriesMap["PII"] = true
		result.Reasoning = append(result.Reasoning, "Social Security Number pattern detected")
		result.RiskLevel = "high"
	}

	// Rule 2: Credit Card → HIGH (PCI)
	if detectCreditCard(text) {
		addFlag(result, "credit_card")
		categoriesMap["PCI"] = true
		result.Reasoning = append(result.Reasoning, "Credit card number pattern detected")
		result.RiskLevel = "high"
	}

	// Rule 3: API Key / Token → HIGH (SECRET)
	if detectAPIKeyOrToken(lowerText) {
		addFlag(result, "api_key")
		categoriesMap["SECRET"] = true
		result.Reasoning = append(result.Reasoning, "API key or authentication token reference detected")
		result.RiskLevel = "high"
	}

	// Rule 4: Email → MEDIUM (PII) if not already high
	if result.RiskLevel != "high" && detectEmail(text) {
		addFlag(result, "email")
		categoriesMap["PII"] = true
		result.Reasoning = append(result.Reasoning, "Email address pattern detected")
		if result.RiskLevel != "high" {
			result.RiskLevel = "medium"
		}
	}

	// Rule 5: Phone → MEDIUM (PII) if not already high
	if result.RiskLevel != "high" && detectPhone(text) {
		addFlag(result, "phone")
		categoriesMap["PII"] = true
		result.Reasoning = append(result.Reasoning, "Phone number pattern detected")
		if result.RiskLevel != "high" {
			result.RiskLevel = "medium"
		}
	}

	// Rule 6: Salary / Compensation → MEDIUM (HR) if not already high
	if result.RiskLevel != "high" && detectSalaryOrCompensation(lowerText) {
		addFlag(result, "salary")
		categoriesMap["HR"] = true
		result.Reasoning = append(result.Reasoning, "Salary or compensation information detected")
		if result.RiskLevel != "high" {
			result.RiskLevel = "medium"
		}
	}

	// Rule 7: IP Address → MEDIUM (PII) if not already high
	if result.RiskLevel != "high" && detectIPAddress(text) {
		addFlag(result, "ip_address")
		categoriesMap["PII"] = true
		result.Reasoning = append(result.Reasoning, "IP address pattern detected")
		if result.RiskLevel != "high" {
			result.RiskLevel = "medium"
		}
	}

	// Convert categories map to sorted slice
	for cat := range categoriesMap {
		result.Categories = append(result.Categories, cat)
	}
}

// addFlag adds a flag and its label to the result
func addFlag(result *ScanResult, flag string) {
	// Check if already added
	for _, existing := range result.Flags {
		if existing == flag {
			return
		}
	}
	result.Flags = append(result.Flags, flag)
	result.Labels = append(result.Labels, flagLabels[flag])
}

// calculateRiskScore returns the highest risk score from detected flags
func calculateRiskScore(flags []string) int {
	highest := 0
	for _, flag := range flags {
		if score, exists := flagScores[flag]; exists {
			if score > highest {
				highest = score
			}
		}
	}
	return highest
}

// determineDecision returns ALLOW, FLAG, or BLOCK based on risk level
func determineDecision(riskLevel string) string {
	switch riskLevel {
	case "high":
		return "BLOCK"
	case "medium":
		return "FLAG"
	default:
		return "ALLOW"
	}
}

// detectSSN returns true if Social Security Number is found
func detectSSN(text string) bool {
	ssnRegex := regexp.MustCompile(`\b\d{3}-\d{2}-\d{4}\b`)
	return ssnRegex.MatchString(text)
}

// detectCreditCard returns true if credit card number is found
func detectCreditCard(text string) bool {
	ccRegex := regexp.MustCompile(`\b(?:\d[ -]*?){13,19}\b`)
	return ccRegex.MatchString(text)
}

// detectPhone returns true if phone number is found
func detectPhone(text string) bool {
	phoneRegex := regexp.MustCompile(`\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b`)
	return phoneRegex.MatchString(text)
}

// detectEmail returns true if email address is found
func detectEmail(text string) bool {
	emailRegex := regexp.MustCompile(`\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b`)
	return emailRegex.MatchString(text)
}

// detectIPAddress returns true if IP address is found
func detectIPAddress(text string) bool {
	ipRegex := regexp.MustCompile(`\b(?:\d{1,3}\.){3}\d{1,3}\b`)
	return ipRegex.MatchString(text)
}

// detectAPIKeyOrToken returns true if API key or token reference is found
func detectAPIKeyOrToken(lowerText string) bool {
	secretKeywords := []string{"api key", "api_key", "token", "password", "secret"}
	for _, keyword := range secretKeywords {
		if strings.Contains(lowerText, keyword) {
			return true
		}
	}
	return false
}

// detectSalaryOrCompensation returns true if salary or compensation data is found
func detectSalaryOrCompensation(lowerText string) bool {
	salaryKeywords := []string{"salary", "compensation", "employee salary", "banking", "account number", "routing number"}
	for _, keyword := range salaryKeywords {
		if strings.Contains(lowerText, keyword) {
			return true
		}
	}
	return false
}

// generateSummary creates a dynamic, neutral single sentence summarizing the scan
func generateSummary(result ScanResult) string {
	if result.RiskLevel == "low" || len(result.Flags) == 0 {
		return "No compliance risks detected in the provided text."
	}

	// Build category description
	var categoryDesc string
	if len(result.Categories) == 1 {
		switch result.Categories[0] {
		case "PII":
			categoryDesc = "personal information"
		case "PCI":
			categoryDesc = "financial data"
		case "HR":
			categoryDesc = "compensation data"
		case "SECRET":
			categoryDesc = "authentication credentials"
		default:
			categoryDesc = "sensitive data"
		}
	} else if len(result.Categories) > 1 {
		// Multiple categories
		categoryDesc = strings.Join(result.Categories, " and ") + " data"
	} else {
		categoryDesc = "sensitive data"
	}

	// Build description of detected items
	var items []string
	for _, flag := range result.Flags {
		switch flag {
		case "ssn":
			items = append(items, "social security numbers")
		case "credit_card":
			items = append(items, "credit card numbers")
		case "api_key":
			items = append(items, "API keys")
		case "email":
			items = append(items, "email addresses")
		case "phone":
			items = append(items, "phone numbers")
		case "salary":
			items = append(items, "salary information")
		case "ip_address":
			items = append(items, "IP addresses")
		}
	}

	itemsDesc := strings.Join(items, " and ")

	// Generate neutral summary based on risk level
	switch result.RiskLevel {
	case "high":
		return "Input contains highly sensitive " + categoryDesc + " (" + itemsDesc + ")."
	case "medium":
		return "Input contains " + categoryDesc + " (" + itemsDesc + ")."
	default:
		return "No compliance risks detected in the provided text."
	}
}
