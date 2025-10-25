# Review Analytics Setup Guide

## Overview

This guide explains how to set up and use the AI-powered review and sentiment analysis system in your SaaS dashboard. The system automatically analyzes user feedback in real-time, categorizes sentiment, and provides visual analytics.

## Features

- **Real-time Sentiment Analysis**: Automatic AI-powered analysis using OpenAI (primary), HuggingFace (fallback), and heuristic backup
- **Multi-tier Confidence Scoring**: Returns sentiment score (-1 to 1), label (POSITIVE/NEGATIVE/NEUTRAL), and confidence (0 to 1)
- **Visual Analytics Dashboard**: Admin-only charts (Pie & Bar) showing sentiment distribution
- **Rate Limiting**: 5 reviews per user per minute to prevent spam
- **Feedback Categories**: Optional classification (PRODUCT, SERVICE, DELIVERY, OTHER)

---

## Prerequisites

1. **Database**: PostgreSQL database URL configured in `.env`
2. **API Keys**: OpenAI and/or HuggingFace API keys (optional but recommended for best results)
3. **Authentication**: NextAuth session (users must be logged in to submit reviews)

---

## Environment Variables

Add the following to your `.env` file:

```env
# AI Providers (optional - system will fall back to heuristics if missing)
OPENAI_API_KEY=sk-...your-key-here...
HF_ACCESS_TOKEN=hf_...your-token-here...
```

- **OpenAI**: Get your API key from https://platform.openai.com/api-keys
- **HuggingFace**: Get your access token from https://huggingface.co/settings/tokens

> **Note**: If you don't provide these keys, the system will use a heuristic fallback that analyzes text with keyword matching. It works but is less accurate than AI models.

---

## Database Schema

The system extends the existing `Review` model with sentiment fields:

```prisma
model Review {
  id                String            @id @default(uuid())
  userId            String
  text              String
  rating            Int?
  sentiment         String?           // Legacy compatibility
  category          String?           // Legacy compatibility
  sentimentScore    Float?            // -1 (negative) to 1 (positive)
  sentimentLabel    SentimentLabel?   // POSITIVE, NEGATIVE, NEUTRAL
  feedbackCategory  FeedbackCategory? // PRODUCT, SERVICE, DELIVERY, OTHER
  aiConfidence      Float?            // 0 to 1
  analyzedAt        DateTime?
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([sentimentLabel])
  @@index([analyzedAt])
}

enum SentimentLabel {
  POSITIVE
  NEGATIVE
  NEUTRAL
}

enum FeedbackCategory {
  PRODUCT
  SERVICE
  DELIVERY
  OTHER
}
```

### Migration

After configuring your `DATABASE_URL`, run:

```bash
npm run db:push
# or
npm run db:migrate
```

This will apply the new sentiment fields to your database.

---

## API Endpoints

### 1. Get All Reviews (GET `/api/reviews`)

Returns all reviews including sentiment data.

**Request**:
```bash
curl http://localhost:3000/api/reviews
```

**Response**:
```json
{
  "reviews": [
    {
      "id": "uuid",
      "userId": "uuid",
      "text": "Great product!",
      "rating": 5,
      "sentimentScore": 0.95,
      "sentimentLabel": "POSITIVE",
      "feedbackCategory": "PRODUCT",
      "aiConfidence": 0.98,
      "analyzedAt": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 2. Submit Review (POST `/api/reviews`)

Submits a new review with automatic sentiment analysis.

**Request**:
```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "text": "The service was excellent but delivery was slow.",
    "rating": 4,
    "feedbackCategory": "SERVICE"
  }'
```

**Response** (Success):
```json
{
  "message": "Review created",
  "review": {
    "id": "uuid",
    "text": "The service was excellent but delivery was slow.",
    "sentiment": "POSITIVE",
    "sentimentScore": 0.65,
    "sentimentLabel": "POSITIVE",
    "feedbackCategory": "SERVICE",
    "aiConfidence": 0.87
  }
}
```

**Response** (Rate Limit):
```json
{
  "error": "Too many reviews. Please try again in a moment."
}
```

**Rate Limit**: 5 reviews per user per minute (in-memory; resets on server restart).

---

## Frontend Implementation

### User Interface (`/reviews` page)

The reviews page provides:

1. **Submit Form**: Text area, rating (1-5), optional category selector
2. **Recent Reviews List**: Shows all reviews with sentiment labels, scores, confidence, and timestamps
3. **Admin Analytics** (Admin role only): Pie chart (distribution) and bar chart (counts)

**Component Structure**:
```
app/
└── reviews/
    ├── page.tsx              # Main page with form and list
    └── components/
        └── ReviewAnalytics.tsx # Recharts-based analytics
```

### Usage

- **Regular Users**: Can submit reviews and see all reviews
- **Admin Users**: See everything + aggregated sentiment analytics dashboard

---

## AI Sentiment Logic

The sentiment analysis uses a **3-tier fallback system** (see `lib/ai.ts`):

1. **Primary: OpenAI GPT-4o-mini**
   - Uses structured output parsing
   - Returns sentiment score, label, and explanation
   - Best accuracy and context understanding

2. **Fallback: HuggingFace Inference API**
   - Uses distilbert-base-uncased-finetuned-sst-2-english model
   - Returns binary sentiment (positive/negative)
   - Fast and reliable

3. **Backup: Heuristic Analysis**
   - Keyword-based scoring (positive words vs. negative words)
   - Works offline with no API keys
   - Basic but functional

**Output Format** (all tiers):
```typescript
{
  score: number;      // -1 (very negative) to 1 (very positive)
  label: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  confidence: number; // 0 (uncertain) to 1 (highly confident)
}
```

---

## Analytics Visualization

The `ReviewAnalytics` component renders two charts using **Recharts**:

### Pie Chart (Sentiment Distribution)
- Shows percentage breakdown: Positive / Negative / Neutral
- Color-coded: Green (positive), Red (negative), Gray (neutral)

### Bar Chart (Sentiment Counts)
- Shows absolute counts for each sentiment category
- Useful for tracking volume trends

**Admin-Only Access**: Only users with `role: 'ADMIN'` can view analytics. The page checks the session and conditionally renders the analytics section.

---

## Testing

### 1. Manual Testing

**Test Positive Sentiment**:
```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{"text": "Absolutely amazing! Best service ever!", "rating": 5}'
```

**Test Negative Sentiment**:
```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{"text": "Terrible experience. Very disappointed.", "rating": 1}'
```

**Test Neutral Sentiment**:
```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{"text": "It was okay. Nothing special.", "rating": 3}'
```

### 2. Rate Limit Testing

Submit 6 reviews rapidly from the same user. The 6th should return:
```json
{ "error": "Too many reviews. Please try again in a moment." }
```

### 3. Analytics Testing

1. Log in as an Admin user
2. Navigate to `/reviews`
3. Verify the "Analytics" section renders with Pie and Bar charts
4. Submit reviews with different sentiments and refresh to see updated charts

---

## Deployment Checklist

- [ ] Set `DATABASE_URL` in production environment
- [ ] Add `OPENAI_API_KEY` and/or `HF_ACCESS_TOKEN` (recommended)
- [ ] Run `npm run db:push` or `npm run db:migrate` to apply schema
- [ ] Test review submission in production
- [ ] Verify admin analytics render correctly
- [ ] Monitor API rate limits and adjust if needed

---

## Troubleshooting

### Issue: "Missing required environment variable: DATABASE_URL"
**Solution**: Add `DATABASE_URL` to `.env` and restart the dev server.

### Issue: "Cannot find module 'recharts'"
**Solution**: Run `npm install` to install all dependencies.

### Issue: AI analysis returns low confidence scores
**Solution**: Ensure `OPENAI_API_KEY` or `HF_ACCESS_TOKEN` is set. Heuristic fallback has lower accuracy.

### Issue: Analytics charts not visible
**Solution**: Ensure logged-in user has `role: 'ADMIN'` in the database.

### Issue: Rate limit blocking legitimate users
**Solution**: Adjust rate limit in `app/api/reviews/route.ts` (currently 5 reviews/min). Consider using Redis for production-grade rate limiting.

---

## Next Steps

1. **Advanced Analytics**: Add time-series trend analysis, category breakdowns, confidence histograms
2. **Notifications**: Alert admins when negative reviews are detected
3. **Export**: Add CSV export for reviews with sentiment data
4. **Feedback Loop**: Allow users to flag incorrect sentiment analysis
5. **A/B Testing**: Compare OpenAI vs. HuggingFace accuracy on your specific use case

---

## Related Documentation

- [SENTIMENT_LOGIC.md](./SENTIMENT_LOGIC.md) - Detailed explanation of the AI analysis pipeline
- [REVIEW_SYSTEM_SUMMARY.md](./REVIEW_SYSTEM_SUMMARY.md) - High-level architecture overview
- [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md) - Full project setup instructions

---

**Questions?** Check the code comments in `lib/ai.ts` and `app/api/reviews/route.ts` for implementation details.
