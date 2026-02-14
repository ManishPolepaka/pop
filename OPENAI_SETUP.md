# OpenAI Integration Setup Guide

## Quick Start

### 1. Get New API Key
1. Go to [OpenAI Platform](https://platform.openai.com/account/api-keys)
2. Delete your old exposed key: `sk-proj-7GUK...` 
3. Click "Create new secret key"
4. Copy the new key

### 2. Update Environment Variable

Open `.env.local` in project root:

```env
VITE_OPENAI_API_KEY=sk-proj-YOUR_NEW_KEY_HERE
```

Replace `YOUR_NEW_KEY_HERE` with your actual new key.

### 3. Restart Dev Server

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

---

## How It Works

### Flow When User Completes Diagnostic

```
1. User answers 10 questions in Insight.tsx
   ↓
2. Clicks "Complete" → navigates to InsightResults
   ↓
3. InsightResults.tsx extracts patterns locally
   ↓
4. Calls generateInsightWithFallback()
   ↓
5. OpenAI generates real, personalized insights
   ↓
6. Saves everything to Firestore:
   - Answers
   - Patterns (local analysis)
   - AI Insights (from OpenAI)
   ↓
7. Updates timeline & detects relationships
   ↓
8. Shows user the 4-section insight
```

### Fallback System

If OpenAI API fails (rate limit, key expired, etc.):
- System falls back to **local pattern-based insights**
- User still gets useful analysis (not blank page)
- No data is lost

---

## Model Details

**Model**: `gpt-4o-mini`
- **Cost**: $0.15 per 1M input tokens, $0.60 per 1M output tokens
- **Per Insight**: ~0.002$ (~2 cents per 1000 users)
- **Speed**: ~1-2 seconds
- **Quality**: Excellent for psychological insight generation

### Cost Examples

| Users | Insights/Month | Cost/Month |
|-------|---|---|
| 100 | 500 | ~$1 |
| 1,000 | 5,000 | ~$10 |
| 10,000 | 50,000 | ~$100 |

---

## Environment Variables

Your `.env.local` should have:

```env
# OpenAI
VITE_OPENAI_API_KEY=sk-proj-YOUR_NEW_KEY_HERE

# Firebase (existing)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
# ... etc
```

> Note: `VITE_` prefix means this will be exposed in frontend (safe, API key only)

---

## Testing

### Test if Integration Works

1. Go to app, click Insight tab
2. Select any category (e.g., Mental & Emotional Strength)
3. Answer a few questions
4. Click "Complete"
5. Wait ~2 seconds for "Generating your insights..."
6. See real OpenAI-powered insights!

### If It Fails

Check browser console (F12 → Console):
- "OpenAI API error" = API key invalid
- "No response from OpenAI" = Network issue
- Falls back to local insights if any error

---

## Security Notes

✅ **Safe**: API key only used for insight generation
✅ **Secure**: Key stored in `.env.local` (not in git)
✅ **Limited**: OpenAI can't see user data (we control the prompts)
✅ **Private**: Firestore rules ensure only user sees their insights

---

## Next Steps

Once verified working:
1. ✅ OpenAI integration (just completed!)
2. Build notification system (30-day retake reminders)
3. Build recommendation engine (suggest next category)
4. Polish UI & settings

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "OpenAI API error" | Check API key is valid and has credits |
| Insights very slow (>5s) | Normal on first request, check network |
| Falls back to local insights | API call failed, check key & network |
| Errors in console | Check `.env.local` has `VITE_OPENAI_API_KEY=...` |

