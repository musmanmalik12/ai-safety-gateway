# 🧪 Updated UI & Testing Guide

## What's New

✅ **Better Sample Data Organization**
- Separate sections for Compliance vs AI Safety testing
- Descriptive buttons with emojis and tooltips
- Each sample shows expected behavior

✅ **Improved Action Buttons**
- Side-by-side layout (red for Compliance, blue for AI Safety)
- Added emoji indicators (📊 for Compliance, 🤖 for AI)
- Better visual feedback

✅ **Enhanced Results Display**
- Separate sections for Compliance and AI results
- Visual separation with colored left borders
- Active mode indicator showing which feature was used
- Better organized cards and sections

✅ **Better Error Handling**
- Detailed error messages from API
- Console logging for debugging
- Clear feedback for BLOCK/FLAG decisions

---

## Quick Testing Steps

### Step 1: Start the System
```bash
cd backend
docker-compose up --build
```

Wait for all services to be ready (should see "Listening and serving HTTP on :3000")

### Step 2: Open Frontend
```
http://localhost:3000
```

---

## Test Compliance Scanning (Red Button)

### Test 1: ALLOW Case
1. Click "✓ Clean" button
2. Click "📊 Scan for Compliance" (RED button)
3. **Expected**:
   - Decision: ALLOW ✅
   - Risk Level: low
   - No flags
   - Assessment: "No compliance risks detected"

### Test 2: FLAG Case (Email)
1. Click "@ Email" button
2. Click "📊 Scan for Compliance" 
3. **Expected**:
   - Decision: FLAG ⚠️
   - Risk Level: medium
   - Flags: `email`
   - Green alert: "Analysis complete"

### Test 3: BLOCK Case (Card)
1. Click "💳 Card" button
2. Click "📊 Scan for Compliance"
3. **Expected**:
   - Decision: BLOCK 🔴
   - Risk Level: high
   - Flags: `credit_card`
   - Assessment mentions card detection

---

## Test AI Safety (Blue Button)

### Test 1: ALLOW Case
1. Click "✓ Clean" under AI Processing samples
2. Enter: `Explain how machine learning works`
3. Click "🤖 Process with AI Safety"
4. **Expected**:
   - Input Risk Level: low
   - Sanitized Prompt: (unchanged)
   - AI Response: "AI Response: [your prompt]"
   - Output Risk Level: low
   - Decision: ALLOW ✅

### Test 2: FLAG Case (Email)
1. Click "@ Email Flag" button
2. Click "🤖 Process with AI Safety"
3. **Expected**:
   - Input Flags: `email`
   - Sanitized Prompt: "...contact@[EMAIL_REDACTED]..."
   - AI Response: (also redacted)
   - Decision: FLAG ⚠️
   - Alert: "Data has been redacted and processed"

### Test 3: Manual Test - SSN (BLOCK)
1. Clear all
2. Enter: `My SSN is 123-45-6789`
3. Click "🤖 Process with AI Safety"
4. **Expected**:
   - Decision: BLOCK 🔴
   - Red alert: "Request blocked"
   - No sanitized prompt or AI response shown

---

## Visual Improvements to Notice

### Results Header
- ✨ New "🔍 ANALYSIS RESULTS" header with emoji
- Shows: Request ID, Status, Active Mode (Compliance vs AI)

### Compliance Section
- 🔴 Red left border indicator
- Organized display: Risk Level → Score Bar → Decision
- Clear separation from AI results

### AI Safety Section  
- 🔵 Blue left border indicator
- Shows both Input and Output analysis
- Clear redaction examples in "Sanitized Prompt" box

### Sample Buttons
- 📋 **Compliance** section (Red theme):
  - ✓ Clean, @ Email, 📞 Phone, 🔴 SSN, 💳 Card, 💰 Salary, ⚠️ Mixed
- 🤖 **AI Processing** section (Blue theme):
  - ✓ Clean, @ Email Flag, 📞 Phone Flag, 📋 Complex

### Action Buttons
- **Red/Emerald gradient**: "📊 Scan for Compliance"
- **Blue/Cyan gradient**: "🤖 Process with AI Safety"
- **Slate**: "🔄 Clear"
- All in same row for easy access

---

## Troubleshooting

### Issue: "Failed to process with AI Safety"
**Solution**:
1. Check browser console (F12) for error details
2. Verify backend is running: `docker-compose ps`
3. Check API logs: `docker-compose logs api`
4. Ensure Frontend env is set:
   ```bash
   cat frontend/.env.local
   # Should show: NEXT_PUBLIC_API_URL=http://localhost:8080
   ```

### Issue: Samples not loading
**Solution**:
1. Hard refresh page: `Ctrl+Shift+R` 
2. Check if textarea is empty first
3. Try typing manually instead

### Issue: Redactions not showing
**Solution**:
- Email must have `@` symbol
- Phone must be formatted like `555-123-4567`
- SSN must be formatted like `123-45-6789`
- Card must be 16 digits (with/without spaces)

### Issue: Results not appearing
**Solution**:
1. Wait for processing to complete
2. Check "Active Mode" indicator
3. For Compliance: should show polling status
4. For AI Safety: should show immediately
5. Check network tab in browser (F12)

---

## Expected Behavior Summary

| Input | Compliance | AI Safety | Decision |
|-------|-----------|-----------|----------|
| Clean text | Scan OK | Process OK | ALLOW |
| With email | Flags | Redacts | FLAG |
| With phone | Flags | Redacts | FLAG |
| With SSN | Blocks | Blocks | BLOCK |
| With card | Blocks | Blocks | BLOCK |
| Mixed PII | Blocks | Blocks | BLOCK |

---

## Key Features to Verify

✅ **Sample Data Buttons**
- Load correct text
- Clear previous results
- Have helpful tooltips

✅ **Action Buttons**
- Red button for Compliance
- Blue button for AI Safety
- Disable during processing
- Clear button resets form

✅ **Results Display**
- Shows results immediately for AI Safety
- Shows polling for Compliance
- Colored left borders for each section
- Active mode indicator is accurate

✅ **Alerts**
- ✓ Green for success
- ✗ Red for errors/blocks
- Auto-dismiss after 5s
- Show decision details

✅ **Redaction**
- Email: `[EMAIL_REDACTED]`
- Phone: `[PHONE_REDACTED]`
- SSN: `[SSN_REDACTED]`
- Card: `[CARD_REDACTED]`

---

## Performance Checks

**AI Safety Response Time**: Should be < 100ms
```bash
time curl -X POST http://localhost:8080/ai/process \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test"}'
```

**Compliance Response Time**: 2-5s (with polling)

---

## Final Verification Checklist

- [ ] System starts without errors
- [ ] Frontend loads at http://localhost:3000
- [ ] Health indicator shows "System operational"
- [ ] Sample buttons work
- [ ] Red button scans for compliance
- [ ] Blue button processes with AI safety
- [ ] Results appear in correct section
- [ ] Redactions work correctly
- [ ] ALLOW/FLAG/BLOCK decisions are accurate
- [ ] Error messages are clear
- [ ] No console errors (F12)

---

**Status**: ✅ All improvements complete - Ready to test!
