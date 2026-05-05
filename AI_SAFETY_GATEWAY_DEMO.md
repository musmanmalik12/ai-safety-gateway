# AI Safety Gateway - Demo Scenarios & Testing

This document describes the demo scenarios for testing the AI Safety Gateway feature.

## Feature Overview

The AI Safety Gateway adds a new endpoint `/ai/process` that:
1. Scans input for compliance risks
2. Applies redaction for sensitive data (FLAG decision)
3. Blocks requests with high-risk data (BLOCK decision)
4. Generates a simulated AI response
5. Scans the output for compliance issues
6. Returns comprehensive results

## Redaction Patterns

- `[EMAIL_REDACTED]` - Email addresses
- `[PHONE_REDACTED]` - Phone numbers
- `[SSN_REDACTED]` - Social Security Numbers
- `[CARD_REDACTED]` - Credit Card numbers
- `[SALARY_REDACTED]` - Salary information
- `[API_KEY_REDACTED]` - API keys and tokens

## Demo Scenarios

### Scenario 1: ALLOW Decision
**Input:** 
```
"Hello summarize this text"
```

**Expected Output:**
```json
{
  "decision": "ALLOW",
  "risk_level": "low",
  "categories": [],
  "flags": [],
  "sanitized_prompt": "Hello summarize this text",
  "ai_response": "AI Response: Hello summarize this text",
  "request_id": "req-xxx",
  "output_risk_level": "low",
  "output_flags": []
}
```

---

### Scenario 2: FLAG Decision (Email + Phone)
**Input:**
```
"My email is john@gmail.com or call 555-123-4567"
```

**Expected Output:**
```json
{
  "decision": "FLAG",
  "risk_level": "medium",
  "categories": ["PII"],
  "flags": ["email", "phone"],
  "sanitized_prompt": "My email is [EMAIL_REDACTED] or call [PHONE_REDACTED]",
  "ai_response": "AI Response: My email is [EMAIL_REDACTED] or call [PHONE_REDACTED]",
  "request_id": "req-xxx",
  "output_risk_level": "low",
  "output_flags": []
}
```

---

### Scenario 3: BLOCK Decision (Credit Card)
**Input:**
```
"My card is 4111 1111 1111 1111"
```

**Expected Output:**
```json
{
  "decision": "BLOCK",
  "risk_level": "high",
  "categories": ["PCI"],
  "flags": ["credit_card"],
  "sanitized_prompt": "",
  "ai_response": "",
  "request_id": "req-xxx",
  "block_reason": "Blocked: Credit card number pattern detected",
  "output_risk_level": "low",
  "output_flags": []
}
```

---

### Scenario 4: BLOCK Decision (SSN)
**Input:**
```
"My SSN is 123-45-6789"
```

**Expected Output:**
```json
{
  "decision": "BLOCK",
  "risk_level": "high",
  "categories": ["PII"],
  "flags": ["ssn"],
  "block_reason": "Blocked: Social Security Number pattern detected",
  "decision": "BLOCK"
}
```

---

## Testing the Feature

### Via Frontend

1. Navigate to http://localhost:3000
2. Click on "SAMPLE DATA" buttons to load test scenarios
3. Click "Process with AI Safety" button
4. Review results showing:
   - Input risk level and detected flags
   - Sanitized prompt with redactions
   - AI response
   - Output risk level and flags

### Via cURL

```bash
# Case 1: ALLOW
curl -X POST http://localhost:8080/ai/process \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello summarize this text"}'

# Case 2: FLAG
curl -X POST http://localhost:8080/ai/process \
  -H "Content-Type: application/json" \
  -d '{"prompt": "My email is john@gmail.com or call 555-123-4567"}'

# Case 3: BLOCK
curl -X POST http://localhost:8080/ai/process \
  -H "Content-Type: application/json" \
  -d '{"prompt": "My card is 4111 1111 1111 1111"}'
```

## Architecture

```
User Input (Frontend)
    ↓
POST /ai/process
    ↓
ProcessWithAISafety()
    ├── ScanText(input) → ScanResult {decision, risk_level, flags}
    ├── Decision: BLOCK?
    │   └── YES → Return BLOCK response
    ├── Decision: FLAG?
    │   └── YES → RedactSensitiveData(input, flags)
    ├── GenerateAIResponse(sanitized_prompt)
    ├── ScanText(ai_response) → Check for output risks
    ├── Apply redaction to output if needed
    └── Return AIProcessResult
    ↓
Response to Frontend
```

## Logging

Each AI processing request generates infrastructure logs:

```
[AI-GATEWAY] request_id=550e8400-e29b-41d4-a716-446655440000 decision=FLAG risk_level=medium input_flags=email,phone
```

This enables monitoring and alerting on:
- Processing decisions
- Risk distribution
- Detected threat types

## Integration Points

1. **API Endpoint**: `POST /ai/process`
2. **Frontend Button**: "Process with AI Safety"
3. **API Client**: `scanAPI.processWithAISafety(prompt)`
4. **Response Type**: `AIProcessResult`

## Future Enhancements

1. Real LLM integration (replace simulated response)
2. Custom redaction templates
3. Persistent audit trail in database
4. Rate limiting per user/API key
5. Custom compliance rules engine
6. Webhook notifications for BLOCK decisions
